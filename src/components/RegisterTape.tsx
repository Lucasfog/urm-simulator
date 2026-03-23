type RegisterTapeProps = {
  values: number[]
  touchedRegisters: number[]
  isRunning: boolean
}

export function RegisterTape({ values, touchedRegisters, isRunning }: RegisterTapeProps) {
  return (
    <div className="relative overflow-x-auto rounded-2xl border border-slate-800 bg-[#22242b] px-4 py-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {isRunning && <div className="tape-scan h-full w-36" />}
      </div>

      <div className="relative w-max min-w-full">
        <div className="grid auto-cols-[minmax(62px,76px)] grid-flow-col border-b border-slate-600 pb-2">
          {values.map((_, index) => (
            <div key={`label-${index}`} className="text-center text-xs font-semibold text-slate-100">
              R{index + 1}
            </div>
          ))}
        </div>

        <div className="grid auto-cols-[minmax(62px,76px)] grid-flow-col">
          {values.map((value, index) => {
            const touched = touchedRegisters.includes(index)
            return (
              <div
                key={`cell-${index}`}
                className={`grid h-14 content-center justify-items-center border border-t-0 border-slate-500 bg-[#2b2d33] ${
                  touched ? 'tape-cell-active' : ''
                }`}
              >
                <span className="font-['Source_Serif_4'] text-sm italic text-slate-300">r{index + 1}</span>
                <strong className="font-mono text-xs text-slate-100">{value}</strong>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
