import type { RegisterTapeProps } from './types/register-tape.types'

export function RegisterTape({ values, touchedRegisters, isRunning, stepCount }: RegisterTapeProps) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[#3c3c3c]/80 bg-[#252526]/80 px-3 py-4 shadow-inner sm:px-4 sm:py-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
        {isRunning && <div className="tape-scan h-full w-36 bg-gradient-to-r from-transparent via-[#0e639c]/20 to-transparent" />}
      </div>

      <div className="relative z-0">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(58px,1fr))] gap-2">
          {values.map((value, index) => {
            const touched = touchedRegisters.includes(index)
            return (
              <div
                key={touched ? `cell-${index}-${stepCount}` : `cell-${index}`}
                className={`group grid min-h-[64px] content-center justify-items-center rounded-lg border px-1 py-1 transition-all duration-300 relative overflow-hidden ${
                  touched 
                    ? 'border-[#4ec9b0]/50 bg-[#4ec9b0]/10 tape-cell-active shadow-[0_0_10px_rgba(78,201,176,0.18)]' 
                    : 'border-[#3c3c3c] bg-[#1e1e1e]/70 hover:border-[#5a5a5a] hover:bg-[#252526]'
                }`}
              >
                {touched && <div className="absolute inset-0 rotate-45 scale-150 transform bg-[#4ec9b0]/10"></div>}
                <span className={`relative z-10 mb-0.5 font-mono text-[10px] tracking-wider sm:text-xs ${touched ? 'font-semibold text-[#4ec9b0]' : 'text-[#858585]'}`}>
                  R{index}
                </span>
                <strong className={`relative z-10 font-mono text-base sm:text-lg ${touched ? 'text-[#d9fff5]' : 'text-[#d4d4d4]'}`}>
                  {value}
                </strong>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
