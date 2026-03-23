import type { Op } from '../lib/urm'
import { toNonNegative } from '../lib/urm'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Separator } from './ui/separator'

type ControlSidebarProps = {
  initialRegisters: number[]
  setInitialRegisters: (registers: number[]) => void
  onLoadRegisters: () => void
  onAddInstruction: (op: Op) => void
}

const blockButtons: Array<{ op: Op; label: string; description: string }> = [
  { op: 'Z', label: 'Z(n)', description: 'Zera registrador' },
  { op: 'S', label: 'S(n)', description: 'Incrementa registrador' },
  { op: 'T', label: 'T(m,n)', description: 'Transfere valor' },
  { op: 'J', label: 'J(m,n,q)', description: 'Salto condicional' },
]

export function ControlSidebar(props: ControlSidebarProps) {
  const { initialRegisters, setInitialRegisters, onLoadRegisters, onAddInstruction } = props

  return (
    <Card className="h-full rounded-none border-y-0 border-l-0 border-r border-r-slate-900 bg-[#0a0c11] shadow-none lg:rounded-2xl lg:border lg:shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-4xl font-normal text-slate-100">URM Simulator</CardTitle>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Editor visual</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="mb-2 text-base font-semibold text-slate-200">Registradores iniciais</h3>
          <div className="grid grid-cols-2 gap-2">
            {initialRegisters.map((value, index) => (
              <label key={`initial-${index}`} className="grid gap-1 text-xs text-slate-400">
                R{index}
                <Input
                  type="number"
                  min={0}
                  value={value}
                  onChange={(event) => {
                    const next = [...initialRegisters]
                    next[index] = toNonNegative(event.target.value)
                    setInitialRegisters(next)
                  }}
                />
              </label>
            ))}
          </div>

          <Button variant="primary" className="mt-3 w-full bg-slate-200 text-slate-900 hover:bg-white" onClick={onLoadRegisters}>
            Aplicar valores
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-200">Blocos URM</h3>
          {blockButtons.map((block) => (
            <button
              key={block.op}
              type="button"
              onClick={() => onAddInstruction(block.op)}
              className="grid w-full grid-cols-[auto_1fr] items-center gap-2 rounded-md border border-slate-900 bg-[#0f1219] px-3 py-2 text-left transition hover:bg-[#181c26]"
            >
              <Badge variant="secondary" className="w-fit">
                {block.label}
              </Badge>
              <span className="text-xs text-slate-400">{block.description}</span>
            </button>
          ))}
        </div>

        <p className="pt-8 text-xs text-slate-500">Desenvolvido por Lucas Fogaca</p>
      </CardContent>
    </Card>
  )
}
