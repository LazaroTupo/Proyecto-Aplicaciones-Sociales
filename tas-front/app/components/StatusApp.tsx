import React from 'react'

const StatusApp = () => {
  return (
    <div className="flex items-center gap-3">
      <span className="px-3 py-1 bg-white border border-slate-300 rounded-full text-xs text-slate-800 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Online
      </span>
    </div>
  )
}

export default StatusApp