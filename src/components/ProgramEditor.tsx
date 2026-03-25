import { useCallback, useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Code2 } from 'lucide-react'
import type * as Monaco from 'monaco-editor'
import { URM_LANGUAGE_ID, setupUrmLanguage, toUrmMarkers } from '../lib/urmMonaco'
import type { Op } from '../lib/urm'
import { instructionHint } from '../lib/urm'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import type { EditorMode, ProgramEditorProps } from './types/program-editor.types'

export function ProgramEditor(props: ProgramEditorProps) {
  const {
    language,
    program,
    theme,
    activePc,
    halted,
    isRunning,
    editorMode,
    setEditorMode,
    programText,
    setProgramText,
    syntaxErrors,
    onApplyTextProgram,
    onLoadTextFromBlocks,
    onUpdateInstruction,
    onRemoveInstruction,
    onMoveInstruction,
    onInsertInstructionAt,
    onApplyMainScript,
  } = props

  const isPtBr = language === 'pt-BR'

  const learningScripts = [
    {
      id: 'addition',
      title: isPtBr ? 'Adicao (R1 + R2 -> R0)' : 'Addition (R1 + R2 -> R0)',
      description: isPtBr
        ? 'Copia R1 para R0 e soma R2 com loop de incremento.'
        : 'Copies R1 into R0 and adds R2 with an increment loop.',
      script: 'z(0)\nt(1,0)\nz(3)\nj(3,2,8)\ns(0)\ns(3)\nj(1,1,4)',
    },
    {
      id: 'subtraction',
      title: isPtBr ? 'Subtracao (R1 - R2 -> R0)' : 'Subtraction (R1 - R2 -> R0)',
      description: isPtBr
        ? 'Subtracao truncada em naturais: retorna max(R1 - R2, 0).'
        : 'Natural-number subtraction: returns max(R1 - R2, 0).',
      script: 'z(0)\nz(3)\nj(3,1,10)\nj(3,2,7)\ns(3)\nj(1,1,3)\ns(0)\ns(3)\nj(1,1,3)',
    },
    {
      id: 'multiplication',
      title: isPtBr ? 'Multiplicacao (R1 * R2 -> R0)' : 'Multiplication (R1 * R2 -> R0)',
      description: isPtBr
        ? 'Soma R1 repetidamente, R2 vezes, para formar o produto.'
        : 'Adds R1 repeatedly, R2 times, to build the product.',
      script: 'z(0)\nz(3)\nj(3,2,12)\nz(4)\nj(4,1,9)\ns(0)\ns(4)\nj(1,1,5)\ns(3)\nj(1,1,3)',
    },
    {
      id: 'division',
      title: isPtBr ? 'Divisao Inteira (R1 / R2 -> R0)' : 'Integer Division (R1 / R2 -> R0)',
      description: isPtBr
        ? 'Calcula piso(R1 / R2). Requer R2 > 0.'
        : 'Computes floor(R1 / R2). Requires R2 > 0.',
      script:
        'z(0)\nz(3)\nj(2,3,22)\nz(5)\nt(3,5)\nz(4)\nj(4,2,11)\ns(5)\ns(4)\nj(1,1,7)\nz(6)\nj(6,5,16)\nj(6,1,20)\ns(6)\nj(1,1,12)\nt(5,3)\ns(0)\nj(3,1,21)\nj(1,1,4)\nj(1,1,22)\nj(1,1,22)',
    },
  ] as const

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof Monaco | null>(null)
  const activeLineDecorationsRef = useRef<string[]>([])

  const updateMarkers = useCallback((value: string) => {
    if (!editorRef.current || !monacoRef.current) {
      return
    }

    const model = editorRef.current.getModel()
    if (!model) {
      return
    }

    const markers = toUrmMarkers(value, monacoRef.current)
    monacoRef.current.editor.setModelMarkers(model, URM_LANGUAGE_ID, markers)
  }, [])

  const handleEditorMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
      editorRef.current = editor
      monacoRef.current = monaco
      setupUrmLanguage(monaco)
      updateMarkers(editor.getValue())
    },
    [updateMarkers]
  )

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const next = value ?? ''
      setProgramText(next)
      updateMarkers(next)
    },
    [setProgramText, updateMarkers]
  )

  useEffect(() => {
    updateMarkers(programText)
  }, [programText, updateMarkers])

  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) {
      return
    }

    if (editorMode !== 'text' || !isRunning || halted) {
      activeLineDecorationsRef.current = editor.deltaDecorations(activeLineDecorationsRef.current, [])
      return
    }

    const lines = programText.split('\n')
    let instructionIndex = 0
    let activeLineNumber = 0

    for (let index = 0; index < lines.length; index += 1) {
      if (lines[index].trim().length === 0) {
        continue
      }

      if (instructionIndex === activePc) {
        activeLineNumber = index + 1
        break
      }

      instructionIndex += 1
    }

    if (activeLineNumber <= 0) {
      activeLineDecorationsRef.current = editor.deltaDecorations(activeLineDecorationsRef.current, [])
      return
    }

    activeLineDecorationsRef.current = editor.deltaDecorations(activeLineDecorationsRef.current, [
      {
        range: new monaco.Range(activeLineNumber, 1, activeLineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'urm-active-line-decoration',
          linesDecorationsClassName: 'urm-active-line-gutter',
        },
      },
    ])

    editor.revealLineInCenterIfOutsideViewport(activeLineNumber)
  }, [activePc, editorMode, halted, isRunning, programText])

  useEffect(() => {
    return () => {
      const editor = editorRef.current
      if (!editor) {
        return
      }
      editor.deltaDecorations(activeLineDecorationsRef.current, [])
    }
  }, [])

  return (
    <Card className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-xl dark:bg-card/70">
      <CardHeader className="pb-4 pt-5 px-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-background/90 p-2">
              <Code2 size={20} className="text-[#569cd6]" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">{isPtBr ? 'Programa' : 'Program'}</CardTitle>
          </div>
          <Badge className="border-none bg-muted px-3 py-1 text-xs text-muted-foreground shadow-inner hover:bg-muted/80">
            {program.length} {isPtBr ? 'linhas' : 'lines'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="min-w-0 flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar">
        <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as EditorMode)} className="min-w-0 flex h-full flex-col">
          <TabsList className="mb-2 flex h-14 w-full items-stretch gap-1 rounded-xl border border-border/80 bg-background/90 p-1.5">
            <TabsTrigger
              value="blocks"
              className="flex-1 !h-full min-w-0 rounded-lg px-5 text-sm font-semibold leading-none text-muted-foreground after:hidden hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {isPtBr ? 'Modo Blocos' : 'Blocks Mode'}
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className="flex-1 !h-full min-w-0 rounded-lg px-5 text-sm font-semibold leading-none text-muted-foreground after:hidden hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {isPtBr ? 'Modo Texto' : 'Text Mode'}
            </TabsTrigger>
            <TabsTrigger
              value="scripts"
              className="flex-1 !h-full min-w-0 rounded-lg px-5 text-sm font-semibold leading-none text-muted-foreground after:hidden hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {isPtBr ? 'Scripts Principais' : 'Main Scripts'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blocks" className="mt-4 space-y-3 flex-1 pb-4">
            {program.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/35 p-12 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-4 text-muted-foreground" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <p className="text-sm text-foreground/85">{isPtBr ? 'O programa esta vazio.' : 'The program is empty.'}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isPtBr ? 'Adicione blocos pela barra lateral.' : 'Add blocks from the sidebar.'}
                </p>
              </div>
            )}
            {program.map((instruction, index) => {
              const isDragging = draggingId === instruction.id;
              const isActive = activePc === index && !halted;
              
              let badgeColor = 'bg-muted text-muted-foreground'
              if (instruction.op === 'Z') badgeColor = 'border border-[#f14c4c]/35 bg-[#f14c4c]/12 text-[#a61b1b] dark:bg-[#f14c4c]/15 dark:text-[#f14c4c]'
              if (instruction.op === 'S') badgeColor = 'border border-[#4ec9b0]/35 bg-[#4ec9b0]/12 text-[#0f766e] dark:bg-[#4ec9b0]/15 dark:text-[#4ec9b0]'
              if (instruction.op === 'T') badgeColor = 'border border-[#569cd6]/35 bg-[#569cd6]/12 text-[#1d4ed8] dark:bg-[#569cd6]/15 dark:text-[#569cd6]'
              if (instruction.op === 'J') badgeColor = 'border border-[#c586c0]/35 bg-[#c586c0]/12 text-[#7e22ce] dark:bg-[#c586c0]/15 dark:text-[#c586c0]'

              return (
                <article
                  key={instruction.id}
                  draggable
                  onDragStart={() => setDraggingId(instruction.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDragEnd={() => setDraggingId(null)}
                  onDrop={() => {
                    if (!draggingId) return
                    if (draggingId.startsWith('NEW_')) {
                      const op = draggingId.replace('NEW_', '') as Op
                      onInsertInstructionAt(op, index)
                      setDraggingId(null)
                      return
                    }
                    onMoveInstruction(draggingId, instruction.id)
                    setDraggingId(null)
                  }}
                  className={`group relative min-w-0 rounded-xl transition-all duration-200 overflow-hidden outline-none cursor-grab active:cursor-grabbing
                    ${isDragging ? 'opacity-40 scale-[0.98] blur-[2px]' : 'opacity-100 scale-100 hover:shadow-lg hover:z-10'}
                    ${isActive 
                      ? 'border-primary bg-primary/10 shadow-[0_0_12px_color-mix(in_oklch,var(--primary)_22%,transparent)] ring-1 ring-primary dark:bg-[#264f78]/35 dark:ring-[#007fd4]' 
                      : 'border border-border bg-background/60 hover:border-border/90'}
                  `}
                >
                  {/* Left accent border */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${instruction.op === 'Z' ? 'bg-[#f14c4c]' : instruction.op === 'S' ? 'bg-[#4ec9b0]' : instruction.op === 'T' ? 'bg-[#569cd6]' : 'bg-[#c586c0]'} ${isActive ? 'opacity-100 shadow-[0_0_10px_currentColor]' : 'opacity-50 group-hover:opacity-100'}`} />
                  
                  <div className="flex flex-col sm:flex-row gap-3 p-3 pl-4 items-start sm:items-center w-full">
                    {/* Header info / Line Number */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center justify-center w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
                          <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
                        </svg>
                      </div>
                      <Badge variant="outline" className="border-border bg-background font-mono text-[10px] uppercase text-muted-foreground">L{index + 1}</Badge>
                      <Badge className={`px-2 py-0.5 rounded shadow-none font-bold ${badgeColor}`}>{instruction.op}</Badge>
                    </div>

                    {/* Inputs */}
                    <div className="flex flex-1 flex-wrap items-center gap-3 border-l border-l-transparent pl-0 sm:border-l-border sm:pl-3">
                      {(instruction.op === 'Z' || instruction.op === 'S') && (
                        <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <span className="opacity-70">n</span>
                          <Input
                            type="number"
                            min={0}
                            value={instruction.a}
                            className="h-8 w-16 border-border bg-background/80 px-2 text-center font-mono text-sm text-foreground focus:border-primary focus:ring-primary"
                            onChange={(event) => onUpdateInstruction(instruction.id, 'a', event.target.value)}
                          />
                        </label>
                      )}

                      {instruction.op === 'T' && (
                        <>
                          <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <span className="opacity-70">m</span>
                            <Input
                              type="number"
                              min={0}
                              value={instruction.a}
                              className="h-8 w-16 border-border bg-background/80 px-2 text-center font-mono text-sm text-foreground focus:border-primary focus:ring-primary"
                              onChange={(event) => onUpdateInstruction(instruction.id, 'a', event.target.value)}
                            />
                          </label>
                          <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <span className="opacity-70">n</span>
                            <Input
                              type="number"
                              min={0}
                              value={instruction.b}
                              className="h-8 w-16 border-border bg-background/80 px-2 text-center font-mono text-sm text-foreground focus:border-primary focus:ring-primary"
                              onChange={(event) => onUpdateInstruction(instruction.id, 'b', event.target.value)}
                            />
                          </label>
                        </>
                      )}

                      {instruction.op === 'J' && (
                        <>
                          <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <span className="opacity-70">m</span>
                            <Input
                              type="number"
                              min={0}
                              value={instruction.a}
                              className="h-8 w-14 border-border bg-background/80 px-2 text-center font-mono text-sm text-foreground focus:border-primary focus:ring-primary sm:w-16"
                              onChange={(event) => onUpdateInstruction(instruction.id, 'a', event.target.value)}
                            />
                          </label>
                          <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <span className="opacity-70">n</span>
                            <Input
                              type="number"
                              min={0}
                              value={instruction.b}
                              className="h-8 w-14 border-border bg-background/80 px-2 text-center font-mono text-sm text-foreground focus:border-primary focus:ring-primary sm:w-16"
                              onChange={(event) => onUpdateInstruction(instruction.id, 'b', event.target.value)}
                            />
                          </label>
                          <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <span className="opacity-70">q</span>
                            <Input
                              type="number"
                              min={1}
                              value={instruction.c}
                              className="h-8 w-14 border-border bg-background/80 px-2 text-center font-mono text-sm text-foreground focus:border-primary focus:ring-primary sm:w-16"
                              onChange={(event) => onUpdateInstruction(instruction.id, 'c', event.target.value)}
                            />
                          </label>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto h-full justify-between">
                       <small className="hidden max-w-[120px] text-[11px] italic leading-tight text-muted-foreground md:block sm:text-right">
                        {instructionHint(instruction, language)}
                       </small>
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8 rounded-full text-muted-foreground transition-colors hover:bg-[#f14c4c]/12 hover:text-[#f14c4c] sm:ml-0"
                        onClick={() => onRemoveInstruction(instruction.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </TabsContent>

          <TabsContent value="text" className="mt-4 space-y-4 flex-1 flex flex-col">
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-foreground/90 dark:text-[#bcdffa]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#569cd6]">
                <circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
              </svg>
              <p className="text-[13px]">
                {isPtBr ? 'Digite uma instrucao por linha.' : 'Type one instruction per line.'} {isPtBr ? 'Exemplo:' : 'Example:'}{' '}
                <code className="rounded bg-background px-1 py-0.5 text-foreground">z(0)</code> {isPtBr ? 'e' : 'and'}{' '}
                <code className="rounded bg-background px-1 py-0.5 text-foreground">j(1,2,6)</code>.
              </p>
            </div>
            <div className="flex-1 min-h-[320px] overflow-hidden rounded-xl border border-border/70 bg-background/80 shadow-inner sm:min-h-[420px]">
              <Editor
                value={programText}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                language={URM_LANGUAGE_ID}
                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                height="100%"
                options={{
                  minimap: { enabled: false },
                  fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: 13,
                  lineHeight: 22,
                  scrollBeyondLastLine: false,
                  wordWrap: 'off',
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  tabSize: 2,
                  padding: { top: 12, bottom: 12 },
                  overviewRulerBorder: false,
                  automaticLayout: true,
                }}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mt-auto pt-2">
              <Button type="button" size="lg" className="bg-primary text-primary-foreground shadow-md shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.98]" onClick={onApplyTextProgram}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {isPtBr ? 'Validar e aplicar' : 'Validate and apply'}
              </Button>
              <Button type="button" size="lg" variant="outline" className="border-border bg-card/70 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.98]" onClick={onLoadTextFromBlocks}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.41 5.41"></path></svg>
                {isPtBr ? 'Sincronizar com blocos' : 'Sync from blocks'}
              </Button>
            </div>

            {syntaxErrors.length > 0 && (
              <div className="flex gap-2 rounded-xl border border-destructive/35 bg-destructive/12 p-4 shadow-sm dark:bg-[#3f1b1b]/45">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-destructive"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <ul className="list-none space-y-1 pb-0 text-sm font-medium text-destructive dark:text-[#ff9d9d]">
                  {syntaxErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="scripts" className="mt-4 space-y-3 flex-1 pb-4">
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-foreground/90 dark:text-[#bcdffa]">
              {isPtBr
                ? 'Escolha um script para estudar. Ao aplicar, o simulador carrega o programa e reinicia a maquina.'
                : 'Choose a script to study. On apply, the simulator loads the program and resets the machine.'}
            </div>

            {learningScripts.map((item) => (
              <article key={item.id} className="rounded-xl border border-border bg-background/55 p-4 shadow-sm transition-colors hover:border-primary/40">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => onApplyMainScript(item.script)}
                  >
                    {isPtBr ? 'Aplicar script' : 'Apply script'}
                  </Button>
                </div>
                <pre className="mt-3 overflow-x-auto rounded-lg border border-border/70 bg-card/70 p-3 text-xs leading-5 text-foreground/90">
                  {item.script}
                </pre>
              </article>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
