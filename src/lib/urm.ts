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

export const MAX_STEPS = 800

export const blockDefaults: Record<Op, Instruction> = {
  Z: { id: '', op: 'Z', a: 0, b: 0, c: 0 },
  S: { id: '', op: 'S', a: 0, b: 0, c: 0 },
  T: { id: '', op: 'T', a: 0, b: 1, c: 0 },
  J: { id: '', op: 'J', a: 0, b: 1, c: 1 },
}

export const demoProgramSeed: Array<Omit<Instruction, 'id'>> = [
  { op: 'Z', a: 0, b: 0, c: 0 },
  { op: 'J', a: 1, b: 2, c: 6 },
  { op: 'S', a: 0, b: 0, c: 0 },
  { op: 'S', a: 2, b: 0, c: 0 },
  { op: 'J', a: 1, b: 1, c: 2 },
]

export function buildInstruction(op: Op): Instruction {
  const base = blockDefaults[op]
  return {
    ...base,
    id: `${op}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  }
}

export function createDemoProgram(): Instruction[] {
  return demoProgramSeed.map((instruction) => ({
    ...instruction,
    id: buildInstruction(instruction.op).id,
  }))
}

export function toNonNegative(value: string | number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }
  return Math.floor(parsed)
}

function ensureRegister(registers: number[], idx: number) {
  while (registers.length <= idx) {
    registers.push(0)
  }
}

export function serializeProgram(program: Instruction[]): string {
  return program
    .map((instruction) => {
      if (instruction.op === 'Z' || instruction.op === 'S') {
        return `${instruction.op.toLowerCase()}(${instruction.a})`
      }
      if (instruction.op === 'T') {
        return `${instruction.op.toLowerCase()}(${instruction.a},${instruction.b})`
      }
      return `${instruction.op.toLowerCase()}(${instruction.a},${instruction.b},${instruction.c})`
    })
    .join('\n')
}

export function parseProgramText(input: string): ParseResult {
  const lines = input.split('\n')
  const parsed: Instruction[] = []
  const errors: string[] = []

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line) {
      return
    }

    const match = line.match(/^([zstj])\s*\((.*)\)$/i)
    if (!match) {
      errors.push(`Linha ${index + 1}: formato invalido. Use z(0), s(1), t(1,2) ou j(1,2,6).`)
      return
    }

    const op = match[1].toUpperCase() as Op
    const args = match[2]
      .split(',')
      .map((arg) => arg.trim())
      .filter((arg) => arg.length > 0)

    const expected = op === 'J' ? 3 : op === 'T' ? 2 : 1
    if (args.length !== expected) {
      errors.push(`Linha ${index + 1}: ${op} espera ${expected} argumento(s).`)
      return
    }

    const values = args.map((arg) => Number(arg))
    if (values.some((value) => !Number.isInteger(value) || value < 0)) {
      errors.push(`Linha ${index + 1}: argumentos devem ser inteiros nao negativos.`)
      return
    }

    if (op === 'J' && values[2] < 1) {
      errors.push(`Linha ${index + 1}: o destino q de J deve ser >= 1.`)
      return
    }

    parsed.push({
      id: buildInstruction(op).id,
      op,
      a: values[0] ?? 0,
      b: values[1] ?? 0,
      c: values[2] ?? 0,
    })
  })

  return { program: parsed, errors }
}

export function createInitialMachine(initialRegisters: number[]): MachineState {
  const normalized = initialRegisters.map((value) => toNonNegative(value)).slice(0, 64)
  while (normalized.length < 8) {
    normalized.push(0)
  }

  return {
    registers: normalized,
    pc: 0,
    halted: false,
    lastTouched: [],
    message: 'Configure o programa e pressione executar.',
    steps: 0,
  }
}

export function executeStep(state: MachineState, program: Instruction[]): MachineState {
  if (state.halted) {
    return state
  }

  if (state.steps >= MAX_STEPS) {
    return {
      ...state,
      halted: true,
      message: `Parado por seguranca apos ${MAX_STEPS} passos.`,
      lastTouched: [],
    }
  }

  if (state.pc < 0 || state.pc >= program.length) {
    return {
      ...state,
      halted: true,
      message: 'Fim do programa: contador saiu da faixa.',
      lastTouched: [],
    }
  }

  const instruction = program[state.pc]
  const registers = [...state.registers]
  const touched = new Set<number>()
  let nextPc = state.pc + 1
  let message = ''

  if (instruction.op === 'Z') {
    ensureRegister(registers, instruction.a)
    registers[instruction.a] = 0
    touched.add(instruction.a)
    message = `L${state.pc + 1}: Z(${instruction.a}) zerou R${instruction.a}.`
  }

  if (instruction.op === 'S') {
    ensureRegister(registers, instruction.a)
    registers[instruction.a] += 1
    touched.add(instruction.a)
    message = `L${state.pc + 1}: S(${instruction.a}) incrementou R${instruction.a}.`
  }

  if (instruction.op === 'T') {
    ensureRegister(registers, Math.max(instruction.a, instruction.b))
    registers[instruction.b] = registers[instruction.a]
    touched.add(instruction.a)
    touched.add(instruction.b)
    message = `L${state.pc + 1}: T(${instruction.a}, ${instruction.b}) copiou R${instruction.a} para R${instruction.b}.`
  }

  if (instruction.op === 'J') {
    ensureRegister(registers, Math.max(instruction.a, instruction.b))
    touched.add(instruction.a)
    touched.add(instruction.b)

    if (registers[instruction.a] === registers[instruction.b]) {
      if (instruction.c === program.length + 1) {
        return {
          registers,
          pc: program.length,
          halted: true,
          lastTouched: [...touched],
          message: `L${state.pc + 1}: J(${instruction.a}, ${instruction.b}, ${instruction.c}) encerrou a execucao.`,
          steps: state.steps + 1,
        }
      }

      if (instruction.c > 0 && instruction.c <= program.length) {
        nextPc = instruction.c - 1
        message = `L${state.pc + 1}: J(${instruction.a}, ${instruction.b}, ${instruction.c}) fez salto para linha ${instruction.c}.`
      } else {
        return {
          ...state,
          halted: true,
          lastTouched: [...touched],
          message: `Linha ${state.pc + 1}: destino de salto invalido (${instruction.c}).`,
          steps: state.steps + 1,
        }
      }
    } else {
      message = `L${state.pc + 1}: J(${instruction.a}, ${instruction.b}, ${instruction.c}) seguiu para proxima linha.`
    }
  }

  if (nextPc >= program.length) {
    return {
      registers,
      pc: nextPc,
      halted: true,
      lastTouched: [...touched],
      message: `${message} Programa finalizado.`,
      steps: state.steps + 1,
    }
  }

  return {
    registers,
    pc: nextPc,
    halted: false,
    lastTouched: [...touched],
    message,
    steps: state.steps + 1,
  }
}

export function instructionHint(instruction: Instruction): string {
  if (instruction.op === 'Z') {
    return `R${instruction.a} = 0`
  }
  if (instruction.op === 'S') {
    return `R${instruction.a} = R${instruction.a} + 1`
  }
  if (instruction.op === 'T') {
    return `R${instruction.b} = R${instruction.a}`
  }
  return `se R${instruction.a} = R${instruction.b}, salta para L${instruction.c}`
}
