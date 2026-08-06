import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'
import { Type } from 'typebox'
import {
  applyReadDefaults,
  contextBudgetDefaults,
  createDiscoveryBudget,
  evaluateDiscoveryCall,
  isDiscoveryShellCommand,
  normalizeProjectPath,
  truncateToolText,
} from '../../scripts/repo-tooling/context-budget/context-budget.ts'
import { createTaskContextPacket, renderTaskContextPacket } from '../../scripts/repo-tooling/context-budget/task-context.ts'

type TextContent = { text: string, type: 'text' }

type RuntimeState = {
  budget: ReturnType<typeof createDiscoveryBudget>
  callKeys: Map<string, string>
  warningCalls: Set<string>
}

function createState(): RuntimeState {
  return {
    budget: createDiscoveryBudget({
      hardLimit: contextBudgetDefaults.discoveryHardLimit,
      warningAt: contextBudgetDefaults.discoveryWarningAt,
    }),
    callKeys: new Map(),
    warningCalls: new Set(),
  }
}

function readKey(input: Record<string, unknown>, cwd: string): string {
  return `read:${normalizeProjectPath(cwd, String(input.path))}:${String(input.offset ?? 1)}:${String(input.limit ?? contextBudgetDefaults.maxReadLines)}`
}

function discoveryKey(toolName: string, input: Record<string, unknown>, cwd: string): string | null {
  if (toolName === 'read')
    return readKey(input, cwd)
  if (toolName === 'bash' && isDiscoveryShellCommand(String(input.command ?? '')))
    return `bash:${String(input.command).trim().replace(/\s+/gu, ' ')}`
  return null
}

function textContent(content: unknown): content is TextContent[] {
  return Array.isArray(content) && content.every(item => typeof item === 'object' && item !== null && 'type' in item)
}

export default function contextBudgetExtension(pi: ExtensionAPI) {
  let state = createState()

  pi.on('before_agent_start', async () => {
    state = createState()
  })

  pi.on('tool_call', async (event, ctx) => {
    const input = event.input as Record<string, unknown>
    const isMutation = event.toolName === 'edit'
      || event.toolName === 'write'
      || (event.toolName === 'bash' && !isDiscoveryShellCommand(String(input.command ?? '')))
    if (isMutation)
      state.budget.seen.clear()
    if (event.toolName === 'read') {
      const normalized = applyReadDefaults({
        limit: typeof input.limit === 'number' ? input.limit : undefined,
        offset: typeof input.offset === 'number' ? input.offset : undefined,
        path: String(input.path),
      }, { maxReadLines: contextBudgetDefaults.maxReadLines })
      Object.assign(input, normalized)
    }

    const key = discoveryKey(event.toolName, input, ctx.cwd)
    if (!key)
      return
    const result = evaluateDiscoveryCall(state.budget, {
      key,
      kind: event.toolName === 'read' ? 'read' : 'search',
    })
    if (result.decision === 'block_duplicate') {
      return {
        block: true,
        reason: `Context budget: duplicate discovery call blocked (${key}). Reuse the earlier evidence or narrow the request.`,
      }
    }
    if (result.decision === 'block_budget') {
      return {
        block: true,
        reason: `Context budget exhausted after ${result.count} discovery calls. Stop broad exploration; synthesize the current evidence or run only focused verification commands.`,
      }
    }
    state.callKeys.set(event.toolCallId, key)
    if (result.decision === 'warn')
      state.warningCalls.add(event.toolCallId)
  })

  pi.on('tool_result', async (event) => {
    const key = state.callKeys.get(event.toolCallId)
    state.callKeys.delete(event.toolCallId)
    if (event.isError) {
      if (key)
        state.budget.seen.delete(key)
      state.warningCalls.delete(event.toolCallId)
      return
    }
    if (!textContent(event.content))
      return
    const input = event.input as Record<string, unknown>
    const isMutation = event.toolName === 'edit'
      || event.toolName === 'write'
      || (event.toolName === 'bash' && !isDiscoveryShellCommand(String(input.command ?? '')))
    if (isMutation)
      state.budget.seen.clear()
    const shouldLimit = event.toolName === 'read'
      || (event.toolName === 'bash' && isDiscoveryShellCommand(String(input.command ?? '')))
    if (!shouldLimit)
      return

    const warning = state.warningCalls.delete(event.toolCallId)
      ? `Context budget warning: ${state.budget.count}/${state.budget.hardLimit} discovery calls used. Prefer task_context, targeted reads, and synthesis over further broad search.`
      : ''
    const textItems = event.content.filter((item): item is TextContent => item.type === 'text')
    const combinedText = [...textItems.map(item => item.text), warning].filter(Boolean).join('\n')
    const result = truncateToolText(combinedText, {
      maxBytes: contextBudgetDefaults.maxToolResultBytes,
      maxLines: contextBudgetDefaults.maxToolResultLines,
    })
    if (!result.truncated && !warning)
      return

    let emittedText = false
    const content = event.content.flatMap((item) => {
      if (item.type !== 'text')
        return [item]
      if (emittedText)
        return []
      emittedText = true
      return [{ ...item, text: result.content }]
    })
    return { content }
  })

  pi.registerTool({
    name: 'task_context',
    label: 'Task context packet',
    description: 'Build a bounded, deduplicated packet of governing AGENTS, rules, and selected Skill references for target paths and intents. Use only when routed governance paths are unknown; do not combine it with separately reading the same governance files.',
    promptSnippet: 'Build routed governance context on demand when the applicable paths are unknown.',
    promptGuidelines: ['Use task_context only when governing paths are unknown, and do not separately reread files already returned by its packet.'],
    parameters: Type.Object({
      intentNames: Type.Optional(Type.Array(Type.String())),
      maxBytes: Type.Optional(Type.Number({ maximum: contextBudgetDefaults.maxPacketBytes, minimum: 1024 })),
      skillNames: Type.Optional(Type.Array(Type.String())),
      targetPaths: Type.Array(Type.String(), { minItems: 1 }),
      testRisk: Type.Optional(Type.Union([Type.Boolean(), Type.Literal('none'), Type.Literal('required')])),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const packet = createTaskContextPacket(ctx.cwd, {
        intentNames: params.intentNames,
        maxBytes: params.maxBytes,
        skillNames: params.skillNames,
        targetPaths: params.targetPaths,
        testRisk: params.testRisk,
      })
      const rendered = renderTaskContextPacket(packet)
      const result = truncateToolText(rendered, {
        maxBytes: params.maxBytes ?? contextBudgetDefaults.maxPacketBytes,
        maxLines: contextBudgetDefaults.maxToolResultLines,
      })
      return {
        content: [{ type: 'text', text: result.content }],
        details: {
          files: packet.files.map(file => file.path),
          omitted: packet.omitted,
          totalBytes: packet.totalBytes,
          truncated: result.truncated,
        },
      }
    },
  })
}
