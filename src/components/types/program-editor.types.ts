import type { Instruction, Op } from '../../lib/urm'

export type EditorMode = 'blocks' | 'text'

export type ProgramEditorProps = {
  program: Instruction[]
  activePc: number
  halted: boolean
  isRunning: boolean
  editorMode: EditorMode
  setEditorMode: (mode: EditorMode) => void
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