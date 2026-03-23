import type { MachineState } from '../lib/urm'
import { RegisterTape } from './RegisterTape'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

type MachinePanelProps = {
  machine: MachineState
  isRunning: boolean
  speedMs: number
  setSpeedMs: (value: number) => void
  programLength: number
  visibleRegisters: number[]
  onRun: () => void
  onPause: () => void
  onStep: () => void
  onReset: () => void
}

export function MachinePanel(props: MachinePanelProps) {
  const {
    machine,
    isRunning,
    speedMs,
    setSpeedMs,
    programLength,
    visibleRegisters,
    onRun,
    onPause,
    onStep,
    onReset,
  } = props

  return (
    <Card className="rounded-2xl border-slate-900 bg-[#0a0c11]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-3xl font-normal text-slate-100">Execução</CardTitle>
          <Badge variant={machine.halted ? 'secondary' : isRunning ? 'accent' : 'default'}>
            {machine.halted ? 'Parado' : isRunning ? 'Executando' : 'Pronto'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button type="button" variant="primary" className="bg-slate-100 text-slate-900" onClick={onRun} disabled={isRunning || programLength === 0}>
            Executar
          </Button>
          <Button type="button" variant="outline" onClick={onPause} disabled={!isRunning}>
            Pausar
          </Button>
          <Button type="button" variant="outline" onClick={onStep} disabled={isRunning || machine.halted || programLength === 0}>
            Passo
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            Reiniciar
          </Button>
        </div>

        <div className="rounded-lg border border-slate-900 bg-[#11141c] p-3">
          <label className="text-sm text-slate-300">
            Velocidade ({speedMs}ms)
            <input
              type="range"
              min={120}
              max={1000}
              step={20}
              value={speedMs}
              onChange={(event) => setSpeedMs(Number(event.target.value))}
              className="mt-2 w-full accent-slate-300"
            />
          </label>

          <div className="mt-3 grid gap-1 text-sm text-slate-400 sm:grid-cols-3">
            <span>PC: L{Math.min(machine.pc + 1, programLength + 1)}</span>
            <span>Passos: {machine.steps}</span>
            <span>Max: {programLength}</span>
          </div>
        </div>

        <p className="rounded-lg border border-slate-900 bg-[#11141c] px-3 py-2 text-sm text-slate-300">{machine.message}</p>

        <div>
          <h3 className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">Fita de registradores</h3>
          <RegisterTape values={visibleRegisters} touchedRegisters={machine.lastTouched} isRunning={isRunning} />
        </div>
      </CardContent>
    </Card>
  )
}
