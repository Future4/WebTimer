import { useEffect, useState } from "react"

type FocusState = {
  isRunning: boolean
  timeLeft: number
  distractionBlocker: boolean
  isPro: boolean
}

const DEFAULT_TIME = 25 * 60 // 25:00

export default function FocusMode() {
  const [state, setState] = useState<FocusState>({
    isRunning: false,
    timeLeft: DEFAULT_TIME,
    distractionBlocker: true,
    isPro: false
  })

  // 格式化时间函数
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 计时器逻辑
  useEffect(() => {
    let interval: number | undefined
    if (state.isRunning && state.timeLeft > 0) {
      interval = window.setInterval(() => {
        setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }, 1000)
    } else if (state.timeLeft === 0) {
      setState(prev => ({ ...prev, isRunning: false }))
      alert("Focus session completed!")
    }
    return () => clearInterval(interval)
  }, [state.isRunning, state.timeLeft])

  const toggleTimer = () => setState(prev => ({ ...prev, isRunning: !prev.isRunning }))
  const resetTimer = () => setState(prev => ({ ...prev, isRunning: false, timeLeft: DEFAULT_TIME }))

  return (
    <div className="flex h-[600px] w-[800px] items-center justify-center bg-[#F4F7FF] font-sans text-slate-900">
      <div className="relative flex h-[540px] w-[740px] flex-col items-center bg-white rounded-[40px] shadow-[0_20px_60px_rgba(22,93,255,0.05)] border border-slate-100/50">
        
        {/* Header */}
        <div className="mt-8 flex items-center gap-2 self-start px-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 shadow-inner">
            <span className="text-lg">⏰</span>
          </div>
          <h1 className="text-sm font-black tracking-widest text-slate-800 uppercase">Focus Mode - Pomodoro</h1>
        </div>

        {/* Main Content */}
        <div className="mt-6 flex flex-1 flex-col items-center w-full px-12">
          
          {/* Big Circular Timer */}
          <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-[#165DFF] border-[6px] border-[#DCE8FF] shadow-[0_20px_40px_rgba(22,93,255,0.25)]">
            <span className="text-[64px] font-black text-white tracking-tighter">
              {formatTime(state.timeLeft)}
            </span>
            {/* Subtle inner glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          </div>

          {/* Control Buttons */}
          <div className="mt-10 flex items-center gap-4">
            <button 
              onClick={toggleTimer}
              className={`flex h-12 items-center gap-2 rounded-xl px-8 font-black text-sm transition-all active:scale-95 ${
                state.isRunning ? 'bg-slate-200 text-slate-400' : 'bg-[#165DFF] text-white shadow-lg shadow-blue-100'
              }`}
            >
              <span className="text-xs">▶</span> START
            </button>
            <button 
              onClick={toggleTimer}
              disabled={!state.isRunning}
              className="flex h-12 items-center gap-2 rounded-xl bg-slate-200 px-8 font-black text-sm text-slate-400 transition-all hover:bg-slate-300 disabled:opacity-50"
            >
              <span className="text-xs">❚❚</span> PAUSE
            </button>
            <button 
              onClick={resetTimer}
              className="flex h-12 items-center gap-2 rounded-xl bg-slate-600 px-8 font-black text-sm text-white transition-all hover:bg-slate-700 active:scale-95"
            >
              <span className="text-xs">↺</span> RESET
            </button>
          </div>

          {/* Distraction Blocker Card */}
          <div className="mt-10 w-full max-w-[500px] rounded-[32px] bg-white p-8 border border-slate-50 shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Distraction Blocker</h3>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <span>🔒 Block distracting websites during focus</span>
                   </div>
                </div>
                {/* Custom Toggle Switch */}
                <div 
                  onClick={() => setState(p => ({ ...p, distractionBlocker: !p.distractionBlocker }))}
                  className={`flex h-8 w-16 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ${state.distractionBlocker ? 'bg-[#165DFF]' : 'bg-slate-200'}`}
                >
                  <div className={`flex h-6 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 ${state.distractionBlocker ? 'translate-x-6' : 'translate-x-0'}`}>
                    <span className="text-[10px] font-black text-[#165DFF]">{state.distractionBlocker ? 'ON' : ''}</span>
                  </div>
                </div>
             </div>
             
             {/* Sub Links */}
             <div className="mt-6 flex items-center justify-center gap-6 text-[11px] font-black text-blue-500 uppercase tracking-tighter">
                <button className="hover:underline">Edit Blocklist</button>
                <span className="text-slate-200">•</span>
                <button className="hover:underline">View Session Report</button>
             </div>
          </div>

          {/* Footer Text */}
          <p className="mt-8 text-center text-[11px] font-bold leading-relaxed text-slate-400 max-w-[480px]">
            Free version limited to 1 session per day. Unlock unlimited sessions and premium features with Pro.
          </p>

          {/* Pro Button */}
          <button className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-6 py-2 border border-slate-200 text-[11px] font-black text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-95">
             <span className="text-yellow-400">★</span> Unlock Unlimited with Pro
          </button>
        </div>
      </div>
    </div>
  )
}