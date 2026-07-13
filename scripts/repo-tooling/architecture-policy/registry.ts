import { ffg01 } from './rules/ffg01.ts'
import { ffg02 } from './rules/ffg02.ts'
import { ffg03 } from './rules/ffg03.ts'
import { ffg04 } from './rules/ffg04.ts'
import { ffg05 } from './rules/ffg05.ts'
import { ffg06 } from './rules/ffg06.ts'
import { ffg07 } from './rules/ffg07.ts'
import type { ArchitecturePolicy } from './types.ts'

export const architecturePolicyRegistry: ArchitecturePolicy[] = [ffg01, ffg02, ffg03, ffg04, ffg05, ffg06, ffg07]
