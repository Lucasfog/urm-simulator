import type { Op } from '../lib/urm'
import { toNonNegative } from '../lib/urm'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import type { ControlSidebarProps } from './types/control-sidebar.types'

const blockButtons: Array<{ op: Op; label: string; description: string }> = [
  { op: 'Z', label: 'Z(n)', description: 'Zera registrador' },
  { op: 'S', label: 'S(n)', description: 'Incrementa registrador' },
  { op: 'T', label: 'T(m,n)', description: 'Transfere valor' },
  { op: 'J', label: 'J(m,n,q)', description: 'Salto condicional' },
]

export function ControlSidebar(props: ControlSidebarProps) {
  const { initialRegisters, setInitialRegisters, onLoadRegisters, onAddInstruction } = props

  return (
    <Card className="flex h-full flex-col min-w-0 rounded-none border-0 bg-transparent shadow-none">
      <CardHeader className="bg-[#1e1e1e]/35 pb-4 pt-6 lg:pt-8">
        <div className="flex items-center gap-2 pl-3 lg:pl-4">
          <div className="flex h-14 w-14 items-center justify-center">
            <img src="/logo.png" alt="Logo URM" className="h-full w-full object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-[#d4d4d4]">
              URM Simulator
            </CardTitle>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#858585]">
              Editor visual
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-6 px-4 lg:px-6 custom-scrollbar">
        <div className="rounded-xl border border-[#3c3c3c]/70 bg-[#252526]/75 p-4 shadow-sm backdrop-blur-sm">
          <h3 className="mb-3 text-sm font-medium text-[#d4d4d4]">
            Registradores iniciais
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-4">
            {initialRegisters.map((value, index) => (
              <label key={`initial-${index}`} className="group grid gap-1 relative">
                <span className="absolute -top-2 left-2 z-10 bg-[#1e1e1e] px-1 text-[10px] font-medium text-[#858585] transition-colors group-focus-within:text-[#569cd6]">
                  R{index}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={value}
                  className="h-10 border-[#3c3c3c] bg-[#1e1e1e]/80 px-2 text-center text-sm text-[#d4d4d4] shadow-inner transition-all focus:border-[#007fd4] focus:bg-[#1e1e1e] focus:ring-1 focus:ring-[#007fd4] focus-visible:ring-[#007fd4]"
                  onChange={(event) => {
                    const next = [...initialRegisters]
                    next[index] = toNonNegative(event.target.value)
                    setInitialRegisters(next)
                  }}
                />
              </label>
            ))}
          </div>

          <Button
            variant="default"
            className="mt-4 w-full bg-[#0e639c] font-medium text-[#f0f6fc] transition-all hover:bg-[#1177bb] hover:shadow-[0_0_12px_rgba(17,119,187,0.28)] active:scale-[0.98]"
            onClick={onLoadRegisters}
          >
            Aplicar valores
          </Button>
        </div>

        <Separator className="bg-[#3c3c3c]/65" />

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#d4d4d4]">
            Blocos de Instrução URM
          </h3>
          <div className="grid gap-2">
            {blockButtons.map((block) => (
              <button
                key={block.op}
                type="button"
                onClick={() => onAddInstruction(block.op)}
                className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-[#3c3c3c] bg-[#252526]/50 p-3 text-left transition-all hover:border-[#4b4b4b] hover:bg-[#2a2d2e]/85 hover:shadow-md hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-[#007fd4]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] transition-transform duration-500 group-hover:translate-x-[100%]"></div>
                <Badge 
                  variant="secondary" 
                  className={`pointer-events-none shrink-0 font-mono text-xs font-semibold shadow-sm
                    ${block.op === 'Z' ? 'bg-[#f14c4c]/15 text-[#f14c4c] border-[#f14c4c]/35' : ''}
                    ${block.op === 'S' ? 'bg-[#4ec9b0]/15 text-[#4ec9b0] border-[#4ec9b0]/35' : ''}
                    ${block.op === 'T' ? 'bg-[#569cd6]/15 text-[#569cd6] border-[#569cd6]/35' : ''}
                    ${block.op === 'J' ? 'bg-[#c586c0]/15 text-[#c586c0] border-[#c586c0]/35' : ''}
                  `}
                >
                  {block.label}
                </Badge>
                <span className="text-xs font-medium text-[#9b9b9b] transition-colors group-hover:text-[#cccccc]">
                  {block.description}
                </span>
                <span className="ml-auto translate-x-2 transform text-[#7f7f7f] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                  +
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 pb-2 sm:pt-8 opacity-60 transition-opacity hover:opacity-100">
          <p className="text-center text-[10px] uppercase tracking-wider text-[#858585]">
            Desenvolvido por{' '}
            <a
              href="https://github.com/lucasfog"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#9b9b9b] underline decoration-[#3c3c3c] underline-offset-2 transition-colors hover:text-[#d4d4d4]"
            >
              Lucas Fogaça
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
