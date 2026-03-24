import type { Op } from '../../lib/urm'

export type ControlSidebarProps = {
  theme: 'dark' | 'light'
  initialRegisters: number[]
  setInitialRegisters: (registers: number[]) => void
  onLoadRegisters: () => void
  onAddInstruction: (op: Op) => void
  onToggleTheme: () => void
}