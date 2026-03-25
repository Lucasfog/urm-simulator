import type { Instruction, MachineState, Op, ParseResult } from './types/urm.types'
import type { Language } from './i18n'

export type { Instruction, MachineState, Op, ParseResult }

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

export function parseProgramText(input: string, language: Language = 'pt-BR'): ParseResult {
  const lines = input.split('\n')
  const parsed: Instruction[] = []
  const errors: string[] = []
  const isPtBr = language === 'pt-BR'

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line) {
      return
    }

    const match = line.match(/^([zstj])\s*\((.*)\)$/i)
    if (!match) {
      errors.push(
        isPtBr
          ? `Linha ${index + 1}: formato invalido. Use z(0), s(1), t(1,2) ou j(1,2,6).`
          : `Line ${index + 1}: invalid format. Use z(0), s(1), t(1,2), or j(1,2,6).`
      )
      return
    }

    const op = match[1].toUpperCase() as Op
    const args = match[2]
      .split(',')
      .map((arg) => arg.trim())
      .filter((arg) => arg.length > 0)

    const expected = op === 'J' ? 3 : op === 'T' ? 2 : 1
    if (args.length !== expected) {
      errors.push(
        isPtBr
          ? `Linha ${index + 1}: ${op} espera ${expected} argumento(s).`
          : `Line ${index + 1}: ${op} expects ${expected} argument(s).`
      )
      return
    }

    const values = args.map((arg) => Number(arg))
    if (values.some((value) => !Number.isInteger(value) || value < 0)) {
      errors.push(
        isPtBr
          ? `Linha ${index + 1}: argumentos devem ser inteiros nao negativos.`
          : `Line ${index + 1}: arguments must be non-negative integers.`
      )
      return
    }

    if (op === 'J' && values[2] < 1) {
      errors.push(
        isPtBr
          ? `Linha ${index + 1}: o destino q de J deve ser >= 1.`
          : `Line ${index + 1}: J destination q must be >= 1.`
      )
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

export function createInitialMachine(initialRegisters: number[], language: Language = 'pt-BR'): MachineState {
  const normalized = initialRegisters.map((value) => toNonNegative(value)).slice(0, 64)
  while (normalized.length < 8) {
    normalized.push(0)
  }

  return {
    registers: normalized,
    pc: 0,
    halted: false,
    lastTouched: [],
    message:
      language === 'pt-BR'
        ? 'Configure o programa e pressione executar.'
        : 'Set up the program and press Run.',
    steps: 0,
  }
}

export function executeStep(state: MachineState, program: Instruction[], language: Language = 'pt-BR'): MachineState {
  const isPtBr = language === 'pt-BR'
  if (state.halted) {
    return state
  }

  if (state.steps >= MAX_STEPS) {
    return {
      ...state,
      halted: true,
      message: isPtBr
        ? `Parado por seguranca apos ${MAX_STEPS} passos.`
        : `Stopped for safety after ${MAX_STEPS} steps.`,
      lastTouched: [],
    }
  }

  if (state.pc < 0 || state.pc >= program.length) {
    return {
      ...state,
      halted: true,
      message: isPtBr
        ? 'Fim do programa: contador saiu da faixa.'
        : 'Program ended: counter went out of range.',
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
    message = isPtBr
      ? `L${state.pc + 1}: Z(${instruction.a}) zerou R${instruction.a}.`
      : `L${state.pc + 1}: Z(${instruction.a}) cleared R${instruction.a}.`
  }

  if (instruction.op === 'S') {
    ensureRegister(registers, instruction.a)
    registers[instruction.a] += 1
    touched.add(instruction.a)
    message = isPtBr
      ? `L${state.pc + 1}: S(${instruction.a}) incrementou R${instruction.a}.`
      : `L${state.pc + 1}: S(${instruction.a}) incremented R${instruction.a}.`
  }

  if (instruction.op === 'T') {
    ensureRegister(registers, Math.max(instruction.a, instruction.b))
    registers[instruction.b] = registers[instruction.a]
    touched.add(instruction.a)
    touched.add(instruction.b)
    message = isPtBr
      ? `L${state.pc + 1}: T(${instruction.a}, ${instruction.b}) copiou R${instruction.a} para R${instruction.b}.`
      : `L${state.pc + 1}: T(${instruction.a}, ${instruction.b}) copied R${instruction.a} to R${instruction.b}.`
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
          message: isPtBr
            ? `L${state.pc + 1}: J(${instruction.a}, ${instruction.b}, ${instruction.c}) encerrou a execucao.`
            : `L${state.pc + 1}: J(${instruction.a}, ${instruction.b}, ${instruction.c}) finished execution.`,
          steps: state.steps + 1,
        }
      }

      if (instruction.c > 0 && instruction.c <= program.length) {
        nextPc = instruction.c - 1
        message = isPtBr
          ? `L${state.pc + 1}: J(${instruction.a}, ${instruction.b}, ${instruction.c}) fez salto para linha ${instruction.c}.`
          : `L${state.pc + 1}: J(${instruction.a}, ${instruction.b}, ${instruction.c}) jumped to line ${instruction.c}.`
      } else {
        return {
          ...state,
          halted: true,
          lastTouched: [...touched],
          message: isPtBr
            ? `Linha ${state.pc + 1}: destino de salto invalido (${instruction.c}).`
            : `Line ${state.pc + 1}: invalid jump destination (${instruction.c}).`,
          steps: state.steps + 1,
        }
      }
    } else {
      message = isPtBr
        ? `L${state.pc + 1}: J(${instruction.a}, ${instruction.b}, ${instruction.c}) seguiu para proxima linha.`
        : `L${state.pc + 1}: J(${instruction.a}, ${instruction.b}, ${instruction.c}) continued to the next line.`
    }
  }

  if (nextPc >= program.length) {
    return {
      registers,
      pc: nextPc,
      halted: true,
      lastTouched: [...touched],
      message: isPtBr ? `${message} Programa finalizado.` : `${message} Program finished.`,
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

export function instructionHint(instruction: Instruction, language: Language = 'pt-BR'): string {
  const isPtBr = language === 'pt-BR'
  if (instruction.op === 'Z') {
    return `R${instruction.a} = 0`
  }
  if (instruction.op === 'S') {
    return `R${instruction.a} = R${instruction.a} + 1`
  }
  if (instruction.op === 'T') {
    return `R${instruction.b} = R${instruction.a}`
  }
  return isPtBr
    ? `se R${instruction.a} = R${instruction.b}, salta para L${instruction.c}`
    : `if R${instruction.a} = R${instruction.b}, jump to L${instruction.c}`
}
