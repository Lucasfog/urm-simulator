import { useCallback, useEffect, useMemo, useState } from 'react'
import { ControlSidebar } from './components/ControlSidebar'
import { MachinePanel } from './components/MachinePanel'
import { ProgramEditor } from './components/ProgramEditor'
import {
  buildInstruction,
  createDemoProgram,
  createInitialMachine,
  executeStep,
  parseProgramText,
  serializeProgram,
  toNonNegative,
  type Instruction,
  type MachineState,
  type Op,
} from './lib/urm'

function App() {
  const [program, setProgram] = useState<Instruction[]>(() => createDemoProgram())
  const [editorMode, setEditorMode] = useState<'blocks' | 'text'>('blocks')
  const [programText, setProgramText] = useState<string>(() => serializeProgram(createDemoProgram()))
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([])

  const [initialRegisters, setInitialRegisters] = useState<number[]>([0, 4, 0, 0, 0, 0, 0, 0])
  const [machine, setMachine] = useState<MachineState>(() => createInitialMachine(initialRegisters))

  const [isRunning, setIsRunning] = useState(false)
  const [speedMs, setSpeedMs] = useState(420)

  const maxRegisterIndex = useMemo(() => {
    const fromProgram = program.flatMap((instruction) => {
      if (instruction.op === 'Z' || instruction.op === 'S') {
        return [instruction.a]
      }
      return [instruction.a, instruction.b]
    })

    return Math.max(11, ...fromProgram, machine.registers.length - 1)
  }, [program, machine.registers.length])

  const visibleRegisters = useMemo(() => {
    const required = Math.max(maxRegisterIndex + 1, machine.registers.length)
    const output = [...machine.registers]
    while (output.length < required) {
      output.push(0)
    }
    return output
  }, [machine.registers, maxRegisterIndex])

  const updateInstruction = (id: string, key: 'a' | 'b' | 'c', value: string) => {
    const parsed = toNonNegative(value)
    setProgram((current) => {
      const next = current.map((instruction) => {
        if (instruction.id !== id) {
          return instruction
        }
        return { ...instruction, [key]: parsed }
      })
      setProgramText(serializeProgram(next))
      return next
    })
  }

  const addInstruction = (op: Op) => {
    setProgram((current) => {
      const next = [...current, buildInstruction(op)]
      setProgramText(serializeProgram(next))
      return next
    })
  }

  const insertInstructionAt = (op: Op, index: number) => {
    setProgram((current) => {
      const next = [...current]
      next.splice(index, 0, buildInstruction(op))
      setProgramText(serializeProgram(next))
      return next
    })
  }

  const removeInstruction = (id: string) => {
    setProgram((current) => {
      const next = current.filter((instruction) => instruction.id !== id)
      setProgramText(serializeProgram(next))
      return next
    })
  }

  const moveInstruction = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) {
      return
    }

    setProgram((current) => {
      const fromIndex = current.findIndex((instruction) => instruction.id === sourceId)
      const toIndex = current.findIndex((instruction) => instruction.id === targetId)
      if (fromIndex === -1 || toIndex === -1) {
        return current
      }

      const reordered = [...current]
      const [picked] = reordered.splice(fromIndex, 1)
      reordered.splice(toIndex, 0, picked)
      setProgramText(serializeProgram(reordered))
      return reordered
    })
  }

  const stepMachine = useCallback(() => {
    setMachine((current) => {
      const next = executeStep(current, program)
      if (next.halted) {
        setIsRunning(false)
      }
      return next
    })
  }, [program])

  const applyTextProgram = () => {
    const parsed = parseProgramText(programText)
    if (parsed.program.length === 0 && parsed.errors.length === 0) {
      setSyntaxErrors(['Programa vazio: informe pelo menos uma instrucao.'])
      setIsRunning(false)
      return
    }

    setSyntaxErrors(parsed.errors)
    if (parsed.errors.length > 0) {
      setIsRunning(false)
      return
    }

    setProgram(parsed.program)
    setMachine(createInitialMachine(initialRegisters))
    setIsRunning(false)
  }

  const loadTextFromBlocks = () => {
    setProgramText(serializeProgram(program))
    setSyntaxErrors([])
  }

  const loadRegistersIntoMachine = () => {
    setMachine(createInitialMachine(initialRegisters))
    setIsRunning(false)
  }

  const resetMachine = () => {
    setIsRunning(false)
    setMachine(createInitialMachine(initialRegisters))
  }

  const runMachine = () => {
    if (editorMode === 'text') {
      const parsed = parseProgramText(programText)
      if (parsed.program.length === 0 && parsed.errors.length === 0) {
        setSyntaxErrors(['Programa vazio: informe pelo menos uma instrucao.'])
        setIsRunning(false)
        return
      }

      setSyntaxErrors(parsed.errors)
      if (parsed.errors.length > 0) {
        setIsRunning(false)
        return
      }
      setProgram(parsed.program)
      setMachine(createInitialMachine(initialRegisters))
      setIsRunning(true)
      return
    }

    if (program.length === 0) {
      setMachine((current) => ({
        ...current,
        message: 'Adicione ao menos uma instrucao para executar.',
      }))
      return
    }

    if (machine.halted) {
      setMachine(createInitialMachine(initialRegisters))
    }

    setIsRunning(true)
  }

  useEffect(() => {
    if (!isRunning || machine.halted) {
      return
    }

    const timer = window.setTimeout(() => {
      stepMachine()
    }, machine.steps === 0 ? 0 : speedMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isRunning, machine.halted, machine.steps, speedMs, stepMachine])

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1e1e1e] text-[#cccccc] selection:bg-[#264f78]/70">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_88%_70%_at_50%_-22%,rgba(14,99,156,0.25),rgba(30,30,30,0))]"></div>
      <div className="mx-auto w-full max-w-[1536px]">
        <section className="flex min-h-screen flex-col lg:flex-row">
          <div className="z-10 w-full bg-[rgba(30,30,30,0.62)] backdrop-blur-xl lg:w-[320px] lg:shrink-0 lg:border-r lg:border-[#3c3c3c]/70">
            <ControlSidebar
              initialRegisters={initialRegisters}
              setInitialRegisters={setInitialRegisters}
              onLoadRegisters={loadRegistersIntoMachine}
              onAddInstruction={addInstruction}
            />
          </div>

          <div className="flex-1 grid min-w-0 gap-4 p-4 lg:p-6 xl:gap-8 lg:grid-cols-2">
            <ProgramEditor
              program={program}
              activePc={machine.pc}
              halted={machine.halted}
              isRunning={isRunning}
              editorMode={editorMode}
              setEditorMode={(mode) => {
                setEditorMode(mode)
                if (mode === 'blocks') {
                  setProgramText(serializeProgram(program))
                  setSyntaxErrors([])
                }
              }}
              programText={programText}
              setProgramText={setProgramText}
              syntaxErrors={syntaxErrors}
              onApplyTextProgram={applyTextProgram}
              onLoadTextFromBlocks={loadTextFromBlocks}
              onUpdateInstruction={updateInstruction}
              onRemoveInstruction={removeInstruction}
              onMoveInstruction={moveInstruction}
              onInsertInstructionAt={insertInstructionAt}
            />

            <MachinePanel
              machine={machine}
              isRunning={isRunning}
              speedMs={speedMs}
              setSpeedMs={setSpeedMs}
              programLength={program.length}
              visibleRegisters={visibleRegisters}
              stepCount={machine.steps}
              onRun={runMachine}
              onPause={() => setIsRunning(false)}
              onStep={stepMachine}
              onReset={resetMachine}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
