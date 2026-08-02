import type { AuditConfig } from './types.ts'

export const defaultAuditConfig: AuditConfig = {
  documentTokenBudget: 2_000,
  duplicateMinimumCharacters: 24,
}
