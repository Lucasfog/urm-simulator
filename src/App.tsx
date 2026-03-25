import { useCallback, useEffect, useMemo, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { ControlSidebar } from './components/ControlSidebar'
import { MachinePanel } from './components/MachinePanel'
import { ProgramEditor } from './components/ProgramEditor'
import { Button } from './components/ui/button'
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
import { DEFAULT_LANGUAGE, type Language } from './lib/i18n'

type Theme = 'dark' | 'light'

const COPY = {
  initialPrompt: {
    'pt-BR': 'Configure o programa e pressione executar.',
    en: 'Set up the program and press Run.',
  },
  emptyProgram: {
    'pt-BR': 'Programa vazio: informe pelo menos uma instrucao.',
    en: 'Empty program: provide at least one instruction.',
  },
  addInstruction: {
    'pt-BR': 'Adicione ao menos uma instrucao para executar.',
    en: 'Add at least one instruction to run.',
  },
} as const

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem('urm-theme')
    return savedTheme === 'light' ? 'light' : 'dark'
  })

  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = window.localStorage.getItem('urm-language')
    return savedLanguage === 'en' ? 'en' : DEFAULT_LANGUAGE
  })
  const isPtBr = language === 'pt-BR'

  const [program, setProgram] = useState<Instruction[]>(() => createDemoProgram())
  const [editorMode, setEditorMode] = useState<'blocks' | 'text'>('blocks')
  const [programText, setProgramText] = useState<string>(() => serializeProgram(createDemoProgram()))
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([])

  const [initialRegisters, setInitialRegisters] = useState<number[]>([0, 4, 0, 0, 0, 0, 0, 0])
  const [machine, setMachine] = useState<MachineState>(() => createInitialMachine(initialRegisters, language))

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
      const next = executeStep(current, program, language)
      if (next.halted) {
        setIsRunning(false)
      }
      return next
    })
  }, [program, language])

  const applyTextProgram = () => {
    const parsed = parseProgramText(programText, language)
    if (parsed.program.length === 0 && parsed.errors.length === 0) {
      setSyntaxErrors([COPY.emptyProgram[language]])
      setIsRunning(false)
      return
    }

    setSyntaxErrors(parsed.errors)
    if (parsed.errors.length > 0) {
      setIsRunning(false)
      return
    }

    setProgram(parsed.program)
    setMachine(createInitialMachine(initialRegisters, language))
    setIsRunning(false)
  }

  const loadTextFromBlocks = () => {
    setProgramText(serializeProgram(program))
    setSyntaxErrors([])
  }

  const loadRegistersIntoMachine = () => {
    setMachine(createInitialMachine(initialRegisters, language))
    setIsRunning(false)
  }

  const resetMachine = () => {
    setIsRunning(false)
    setMachine(createInitialMachine(initialRegisters, language))
  }

  const runMachine = () => {
    if (editorMode === 'text') {
      const parsed = parseProgramText(programText, language)
      if (parsed.program.length === 0 && parsed.errors.length === 0) {
        setSyntaxErrors([COPY.emptyProgram[language]])
        setIsRunning(false)
        return
      }

      setSyntaxErrors(parsed.errors)
      if (parsed.errors.length > 0) {
        setIsRunning(false)
        return
      }
      setProgram(parsed.program)
      setMachine(createInitialMachine(initialRegisters, language))
      setIsRunning(true)
      return
    }

    if (program.length === 0) {
      setMachine((current) => ({
        ...current,
        message: COPY.addInstruction[language],
      }))
      return
    }

    if (machine.halted) {
      setMachine(createInitialMachine(initialRegisters, language))
    }

    setIsRunning(true)
  }

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('urm-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('urm-language', language)
  }, [language])

  useEffect(() => {
    setMachine((current) => {
      const isInitialPrompt =
        current.message === COPY.initialPrompt['pt-BR'] || current.message === COPY.initialPrompt.en

      if (!isInitialPrompt) {
        return current
      }

      const nextMessage = COPY.initialPrompt[language]
      if (current.message === nextMessage) {
        return current
      }

      return {
        ...current,
        message: nextMessage,
      }
    })
  }, [language])

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
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/30">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_75%_0%,rgba(14,99,156,0.12),transparent_35%),radial-gradient(circle_at_10%_100%,rgba(14,99,156,0.08),transparent_45%)] dark:bg-[radial-gradient(ellipse_88%_70%_at_50%_-22%,rgba(14,99,156,0.25),rgba(30,30,30,0))]"></div>
      <div className="mx-auto w-full max-w-[1536px]">
        <div className="pointer-events-none fixed right-4 top-4 z-50 lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className="pointer-events-auto rounded-full border-border/80 bg-card/90 text-foreground shadow-lg backdrop-blur hover:bg-accent"
            aria-label={
              theme === 'dark'
                ? isPtBr
                  ? 'Ativar tema claro'
                  : 'Switch to light theme'
                : isPtBr
                  ? 'Ativar tema escuro'
                  : 'Switch to dark theme'
            }
            title={
              theme === 'dark'
                ? isPtBr
                  ? 'Ativar tema claro'
                  : 'Switch to light theme'
                : isPtBr
                  ? 'Ativar tema escuro'
                  : 'Switch to dark theme'
            }
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
        <section className="flex min-h-screen flex-col lg:flex-row">
          <div className="z-10 w-full bg-card/70 backdrop-blur-xl lg:w-[320px] lg:shrink-0 lg:border-r lg:border-border/70">
            <ControlSidebar
              theme={theme}
              language={language}
              initialRegisters={initialRegisters}
              setInitialRegisters={setInitialRegisters}
              onLoadRegisters={loadRegistersIntoMachine}
              onAddInstruction={addInstruction}
              onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              onLanguageChange={setLanguage}
            />
          </div>

          <div className="flex-1 grid min-w-0 gap-4 p-4 lg:p-6 xl:gap-8 lg:grid-cols-2">
            <ProgramEditor
              language={language}
              program={program}
              theme={theme}
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
              language={language}
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
