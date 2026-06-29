import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import LeaveTypeBadge from '../components/LeaveTypeBadge'
import { PageLoader } from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { Eye, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']
const TYPE_FILTERS   = ['ALL', 'CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY']

export default function AllLeavesPage() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [detailLeave, setDetailLeave] = useState(null)

  useEffect(() => {
    api.get('/leave/all')
      .then(res => setLeaves(res.data.data || []))
      .catch(() => toast.error('Failed to load leaves'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = leaves
    .filter(l => statusFilter === 'ALL' || l.status === statusFilter)
    .filter(l => typeFilter === 'ALL' || l.leaveType === typeFilter)
    .filter(l => !search || l.employeeName?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn))

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">All Leave Requests</h1>
        <p className="text-slate-500 text-sm mt-0.5">{leaves.length} total · {filtered.length} showing</p>
      </div>

      {/* Filters */}
      <div className="card py-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 py-2 text-sm"
              placeholder="Search by employee name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center mr-1"><Filter size={12} className="mr-1" /> Status:</span>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center mr-1"><Filter size={12} className="mr-1" /> Type:</span>
          {TYPE_FILTERS.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === t ? 'bg-accent-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No results" description="Try adjusting your filters." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Employee', 'Type', 'Period', 'Days', 'Applied', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {l.employeeName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">{l.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><LeaveTypeBadge type={l.leaveType} /></td>
                    <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {l.startDate} <span className="text-slate-300 mx-0.5">→</span> {l.endDate}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{l.totalDays}d</td>
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{l.appliedOn}</td>
                    <td className="px-5 py-4"><StatusBadge status={l.status} /></td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setDetailLeave(l)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!detailLeave} onClose={() => setDetailLeave(null)} title="Leave Request Details">
        {detailLeave && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <LeaveTypeBadge type={detailLeave.leaveType} />
              <StatusBadge status={detailLeave.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Employee', detailLeave.employeeName],
                ['Start Date', detailLeave.startDate],
                ['End Date', detailLeave.endDate],
                ['Total Days', `${detailLeave.totalDays} days`],
                ['Applied On', detailLeave.appliedOn],
                ['Action Date', detailLeave.actionDate || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">{k}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            {detailLeave.reason && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-medium mb-1">Reason</p>
                <p className="text-sm text-slate-700">{detailLeave.reason}</p>
              </div>
            )}
            {detailLeave.managerRemarks && (
              <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                <p className="text-xs text-primary-600 font-medium mb-1">Manager Remarks</p>
                <p className="text-sm text-slate-700">{detailLeave.managerRemarks}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
