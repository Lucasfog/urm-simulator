import { Terminal } from 'lucide-react'
import { RegisterTape } from './RegisterTape'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import type { MachinePanelProps } from './types/machine-panel.types'

export function MachinePanel(props: MachinePanelProps) {
  const {
    machine,
    isRunning,
    speedMs,
    setSpeedMs,
    programLength,
    visibleRegisters,
    stepCount,
    onRun,
    onPause,
    onStep,
    onReset,
  } = props

  return (
    <Card className="flex h-fit min-w-0 flex-col rounded-2xl border border-[#3c3c3c] bg-[#252526]/70 backdrop-blur-md shadow-xl lg:h-full">
      <CardHeader className="pb-4 pt-5 px-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3c3c3c]/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#1e1e1e]/90 p-2">
              <Terminal size={20} className="text-[#4ec9b0]" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight text-[#d4d4d4]">Execução</CardTitle>
          </div>
          <Badge 
            variant={machine.halted ? 'secondary' : 'default'} 
            className={`shadow-inner px-3 py-1 text-xs border-none
              ${machine.halted ? 'bg-[#2d2d30] text-[#858585]' : isRunning ? 'border border-[#4ec9b0]/35 bg-[#4ec9b0]/18 text-[#4ec9b0]' : 'bg-[#569cd6]/18 text-[#569cd6]'}`}
          >
            {machine.halted ? 'Parado' : isRunning ? 'Executando' : 'Pronto'}
            {isRunning && <span className="ml-2 h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ec9b0]"></span>}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-5 pb-5">
        <div className="grid gap-3 sm:grid-cols-4">
          <Button 
            type="button" 
            className="sm:col-span-2 bg-[#0e639c] text-[#f0f6fc] shadow-md shadow-[#0e639c]/30 transition-all hover:bg-[#1177bb] active:scale-[0.98] disabled:opacity-50" 
            onClick={onRun} 
            disabled={isRunning}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 fill-current"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Executar
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="border-[#3c3c3c] bg-[#2d2d30]/75 text-[#c7c7c7] transition-all hover:bg-[#333337] active:scale-[0.98] disabled:opacity-50" 
            onClick={onPause} 
            disabled={!isRunning}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 fill-current"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            Pausar
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="border-[#3c3c3c] bg-[#2d2d30]/75 text-[#c7c7c7] transition-all hover:bg-[#333337] active:scale-[0.98] disabled:opacity-50" 
            onClick={onStep} 
            disabled={isRunning || machine.halted || programLength === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
            Passo
          </Button>
        </div>

        <div className="flex gap-2 justify-end mt-2">
           <Button type="button" variant="ghost" size="sm" className="text-[#8a8a8a] hover:bg-[#2d2d30] hover:text-[#d4d4d4]" onClick={onReset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            Reiniciar
          </Button>
        </div>

        <div className="rounded-xl border border-[#3c3c3c]/70 bg-[#1e1e1e]/75 p-4 shadow-inner">
          <label className="mb-3 flex items-center justify-between text-sm font-medium text-[#c7c7c7]">
            Velocidade
            <span className="rounded bg-[#252526] px-2 py-1 font-mono text-xs text-[#858585]">{speedMs}ms</span>
          </label>
          <input
            type="range"
            min={120}
            max={1000}
            step={20}
            value={speedMs}
            onChange={(event) => setSpeedMs(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#2d2d30] accent-[#007fd4] hover:accent-[#569cd6] focus:outline-none focus:ring-2 focus:ring-[#007fd4]/40"
          />

          <div className="mt-5 flex items-center justify-between border-t border-[#3c3c3c]/70 pt-4 text-sm font-medium text-[#858585]">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[10px] uppercase tracking-wider opacity-60">PC</span>
              <span className="mt-1 rounded bg-[#2d2d30]/80 px-2 py-0.5 font-mono text-[#d4d4d4] shadow-inner">L{Math.min(machine.pc + 1, programLength + 1)}</span>
            </div>
            <div className="h-6 w-[1px] bg-[#3c3c3c]"></div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-[10px] uppercase tracking-wider opacity-60">Passos</span>
              <span className="mt-1 font-mono text-[#d4d4d4]">{machine.steps}</span>
            </div>
            <div className="h-6 w-[1px] bg-[#3c3c3c]"></div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-[10px] uppercase tracking-wider opacity-60">Máx</span>
              <span className="mt-1 font-mono text-[#d4d4d4]">{programLength}</span>
            </div>
          </div>
        </div>

        <div className="flex min-h-[60px] items-center rounded-xl border border-[#3c3c3c]/70 bg-[#1e1e1e]/75 p-4 shadow-inner">
          <p className={`flex items-center gap-2 text-sm tracking-wide ${machine.halted ? 'font-medium text-[#4ec9b0]' : 'font-mono text-[#8f8f8f]'}`}>
            {machine.halted && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            {machine.message}
          </p>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
             <div className="rounded-md bg-[#1e1e1e]/90 p-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#dcdcaa]"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"></path></svg>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c7c7c7]">Fita de registradores</h3>
          </div>
          <RegisterTape values={visibleRegisters} touchedRegisters={machine.lastTouched} isRunning={isRunning} stepCount={stepCount} />
        </div>
      </CardContent>
    </Card>
  )
}
