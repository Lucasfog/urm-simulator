import type { Op } from '../../lib/urm'
import type { Language } from '../../lib/i18n'

export type ControlSidebarProps = {
  theme: 'dark' | 'light'
  language: Language
  initialRegisters: number[]
  setInitialRegisters: (registers: number[]) => void
  onLoadRegisters: () => void
  onAddInstruction: (op: Op) => void
  onToggleTheme: () => void
  onLanguageChange: (language: Language) => void
}