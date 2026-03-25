import type { MachineState } from '../../lib/urm'
import type { Language } from '../../lib/i18n'

export type MachinePanelProps = {
  language: Language
  machine: MachineState
  isRunning: boolean
  speedMs: number
  setSpeedMs: (value: number) => void
  programLength: number
  visibleRegisters: number[]
  stepCount: number
  onRun: () => void
  onPause: () => void
  onStep: () => void
  onReset: () => void
}