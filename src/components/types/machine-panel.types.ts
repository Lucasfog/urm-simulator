import type { MachineState } from '../../lib/urm'

export type MachinePanelProps = {
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