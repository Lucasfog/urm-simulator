export type Op = 'Z' | 'S' | 'T' | 'J'

export type Instruction = {
  id: string
  op: Op
  a: number
  b: number
  c: number
}

export type MachineState = {
  registers: number[]
  pc: number
  halted: boolean
  lastTouched: number[]
  message: string
  steps: number
}

export type ParseResult = {
  program: Instruction[]
  errors: string[]
}
