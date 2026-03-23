import type { Op } from '../../lib/urm'

export type ControlSidebarProps = {
  initialRegisters: number[]
  setInitialRegisters: (registers: number[]) => void
  onLoadRegisters: () => void
  onAddInstruction: (op: Op) => void
}