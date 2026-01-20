import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

export interface TechStackItem {
  category: string
  technology: string
}

const TABLE_HEADER = '| Category'

function parseMarkdownTable(lines: string[]): TechStackItem[] {
  const rows: TechStackItem[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|'))
      continue
    if (trimmed.includes('---'))
      continue
    const cells = trimmed.split('|').map(cell => cell.trim()).filter(Boolean)
    if (cells.length >= 2 && cells[0] !== 'Category')
      rows.push({ category: cells[0], technology: cells[1] })
  }
  return rows
}

export async function getTechStackFromReadme(): Promise<TechStackItem[]> {
  const readmePath = path.join(process.cwd(), 'readme.md')
  const content = await fs.readFile(readmePath, 'utf-8')
  const lines = content.split('\n')
  const startIndex = lines.findIndex(line => line.includes(TABLE_HEADER))
  if (startIndex === -1)
    return []
  const tableLines: string[] = []
  for (let i = startIndex; i < lines.length; i += 1) {
    const line = lines[i]
    if (!line.trim().startsWith('|'))
      break
    tableLines.push(line)
  }
  return parseMarkdownTable(tableLines)
}
