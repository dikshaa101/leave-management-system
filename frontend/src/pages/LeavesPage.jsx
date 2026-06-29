import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import LeaveTypeBadge from '../components/LeaveTypeBadge'
import { PageLoader } from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { CalendarCheck2, Trash2, Eye, Filter } from 'lucide-react'

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [detailLeave, setDetailLeave] = useState(null)
  const [cancelId, setCancelId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => { fetchLeaves() }, [])

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const res = await api.get('/leave/my-leaves')
      setLeaves(res.data.data || [])
    } catch (_) {
      toast.error('Failed to load leaves')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await api.delete(`/leave/${cancelId}`)
      toast.success('Leave request cancelled')
      setCancelId(null)
      fetchLeaves()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel leave')
    } finally {
      setCancelling(false)
    }
  }

  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter)
  const sorted = [...filtered].sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn))

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Leave Requests</h1>
          <p className="text-slate-500 text-sm mt-0.5">{leaves.length} total requests</p>
        </div>
        <Link to="/leaves/apply" className="btn-primary">
          <CalendarCheck2 size={18} />
          Apply for Leave
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === s
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s} {s !== 'ALL' && leaves.filter(l => l.status === s).length > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${filter === s ? 'bg-white/20' : 'bg-slate-100'}`}>
                {leaves.filter(l => l.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <EmptyState
          title="No leave requests"
          description="You haven't applied for any leave yet."
          action={<Link to="/leaves/apply" className="btn-primary">Apply Now</Link>}
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Type', 'Period', 'Days', 'Reason', 'Applied On', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4"><LeaveTypeBadge type={l.leaveType} /></td>
                    <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                      <span>{l.startDate}</span>
                      <span className="text-slate-300 mx-1">→</span>
                      <span>{l.endDate}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{l.totalDays}d</td>
                    <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate">{l.reason || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{l.appliedOn}</td>
                    <td className="px-5 py-4"><StatusBadge status={l.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailLeave(l)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        {l.status === 'PENDING' && (
                          <button
                            onClick={() => setCancelId(l.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancel leave"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
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
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Start Date', detailLeave.startDate],
                ['End Date', detailLeave.endDate],
                ['Total Days', `${detailLeave.totalDays} day${detailLeave.totalDays !== 1 ? 's' : ''}`],
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
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium mb-1">Manager Remarks</p>
                <p className="text-sm text-slate-700">{detailLeave.managerRemarks}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel confirm modal */}
      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Leave Request" size="sm">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to cancel this leave request? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setCancelId(null)} className="btn-secondary flex-1">Keep It</button>
            <button onClick={handleCancel} disabled={cancelling} className="btn-danger flex-1">
              {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
