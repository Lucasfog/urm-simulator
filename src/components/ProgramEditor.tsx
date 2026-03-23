import { useState } from 'react'
import type { Instruction, Op } from '../lib/urm'
import { instructionHint } from '../lib/urm'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Textarea } from './ui/textarea'

type ProgramEditorProps = {
  program: Instruction[]
  activePc: number
  halted: boolean
  editorMode: 'blocks' | 'text'
  setEditorMode: (mode: 'blocks' | 'text') => void
  programText: string
  setProgramText: (value: string) => void
  syntaxErrors: string[]
  onApplyTextProgram: () => void
  onLoadTextFromBlocks: () => void
  onUpdateInstruction: (id: string, key: 'a' | 'b' | 'c', value: string) => void
  onRemoveInstruction: (id: string) => void
  onMoveInstruction: (sourceId: string, targetId: string) => void
  onInsertInstructionAt: (op: Op, index: number) => void
}

export function ProgramEditor(props: ProgramEditorProps) {
  const {
    program,
    activePc,
    halted,
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
  } = props

  const [draggingId, setDraggingId] = useState<string | null>(null)

  return (
    <Card className="h-full rounded-2xl border-slate-900 bg-[#0a0c11]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-3xl font-normal text-slate-100">Program</CardTitle>
          <Badge variant="secondary">{program.length} linhas</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as 'blocks' | 'text')}>
          <TabsList className="w-full justify-start gap-1 bg-[#05070b]">
            <TabsTrigger value="blocks" className="min-w-40">
              Modo blocos
            </TabsTrigger>
            <TabsTrigger value="text" className="min-w-40">
              Modo texto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blocks" className="mt-4 space-y-2">
            {program.map((instruction, index) => (
              <article
                key={instruction.id}
                draggable
                onDragStart={() => setDraggingId(instruction.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (!draggingId) {
                    return
                  }

                  if (draggingId.startsWith('NEW_')) {
                    const op = draggingId.replace('NEW_', '') as Op
                    onInsertInstructionAt(op, index)
                    setDraggingId(null)
                    return
                  }

                  onMoveInstruction(draggingId, instruction.id)
                  setDraggingId(null)
                }}
                className={`rounded-xl border p-3 ${
                  activePc === index && !halted
                    ? 'border-sky-700 bg-sky-950/30'
                    : 'border-slate-900 bg-[#11141c]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="secondary">L{index + 1}</Badge>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveInstruction(instruction.id)}
                  >
                    Remover
                  </Button>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="text-sm font-semibold text-slate-100">{instruction.op}</div>

                  {(instruction.op === 'Z' || instruction.op === 'S') && (
                    <label className="grid gap-1 text-xs text-slate-400">
                      n
                      <Input
                        type="number"
                        min={0}
                        value={instruction.a}
                        onChange={(event) => onUpdateInstruction(instruction.id, 'a', event.target.value)}
                      />
                    </label>
                  )}

                  {instruction.op === 'T' && (
                    <>
                      <label className="grid gap-1 text-xs text-slate-400">
                        m
                        <Input
                          type="number"
                          min={0}
                          value={instruction.a}
                          onChange={(event) => onUpdateInstruction(instruction.id, 'a', event.target.value)}
                        />
                      </label>
                      <label className="grid gap-1 text-xs text-slate-400">
                        n
                        <Input
                          type="number"
                          min={0}
                          value={instruction.b}
                          onChange={(event) => onUpdateInstruction(instruction.id, 'b', event.target.value)}
                        />
                      </label>
                    </>
                  )}

                  {instruction.op === 'J' && (
                    <>
                      <label className="grid gap-1 text-xs text-slate-400">
                        m
                        <Input
                          type="number"
                          min={0}
                          value={instruction.a}
                          onChange={(event) => onUpdateInstruction(instruction.id, 'a', event.target.value)}
                        />
                      </label>
                      <label className="grid gap-1 text-xs text-slate-400">
                        n
                        <Input
                          type="number"
                          min={0}
                          value={instruction.b}
                          onChange={(event) => onUpdateInstruction(instruction.id, 'b', event.target.value)}
                        />
                      </label>
                      <label className="grid gap-1 text-xs text-slate-400">
                        q
                        <Input
                          type="number"
                          min={1}
                          value={instruction.c}
                          onChange={(event) => onUpdateInstruction(instruction.id, 'c', event.target.value)}
                        />
                      </label>
                    </>
                  )}

                  <small className="sm:col-span-3 text-xs text-slate-500">{instructionHint(instruction)}</small>
                </div>
              </article>
            ))}
          </TabsContent>

          <TabsContent value="text" className="mt-4 space-y-3">
            <p className="text-sm text-slate-400">Digite uma instrução por linha. Exemplo: z(0) e j(1,2,6).</p>
            <Textarea
              value={programText}
              onChange={(event) => setProgramText(event.target.value)}
              spellCheck={false}
              placeholder={'z(0)\nj(1,2,6)'}
              className="min-h-[420px] font-mono"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="primary" className="bg-slate-100 text-slate-900" onClick={onApplyTextProgram}>
                Validar e aplicar
              </Button>
              <Button type="button" variant="outline" onClick={onLoadTextFromBlocks}>
                Sincronizar com blocos
              </Button>
            </div>

            {syntaxErrors.length > 0 && (
              <ul className="space-y-1 rounded-md border border-rose-900 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
                {syntaxErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
