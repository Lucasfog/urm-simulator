import type { Instruction, Op } from '../../lib/urm'
import type { Language } from '../../lib/i18n'

export type EditorMode = 'blocks' | 'text' | 'scripts'

export type ProgramEditorProps = {
  language: Language
  program: Instruction[]
  theme: 'dark' | 'light'
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
  onApplyMainScript: (scriptText: string) => void
}