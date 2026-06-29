import React from 'react'

const map = {
  CASUAL:    'bg-blue-100 text-blue-700',
  SICK:      'bg-rose-100 text-rose-700',
  EARNED:    'bg-violet-100 text-violet-700',
  MATERNITY: 'bg-pink-100 text-pink-700',
  PATERNITY: 'bg-cyan-100 text-cyan-700',
}

export default function LeaveTypeBadge({ type }) {
  const cls = map[type] || 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {type}
    </span>
  )
}
