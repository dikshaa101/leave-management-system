import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import LeaveTypeBadge from '../components/LeaveTypeBadge'
import StatusBadge from '../components/StatusBadge'
import { PageLoader } from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { CheckCircle2, XCircle, Eye, Clock } from 'lucide-react'

export default function PendingLeavesPage() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLeave, setActionLeave] = useState(null)   // { leave, action: 'approve'|'reject' }
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [detailLeave, setDetailLeave] = useState(null)

  useEffect(() => { fetchLeaves() }, [])

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const res = await api.get('/manager/leaves/pending')
      setLeaves(res.data.data || [])
    } catch (_) { toast.error('Failed to load pending leaves') }
    finally { setLoading(false) }
  }

  const submitAction = async () => {
    const { leave, action } = actionLeave
    setSubmitting(true)
    try {
      await api.put(`/manager/leaves/${leave.id}/${action}`, { remarks })
      toast.success(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      setActionLeave(null)
      setRemarks('')
      fetchLeaves()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pending Leaves</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {leaves.length} request{leaves.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
        {leaves.length > 0 && (
          <span className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold">
            <Clock size={16} />
            {leaves.length} Pending
          </span>
        )}
      </div>

      {leaves.length === 0 ? (
        <EmptyState
          title="No pending requests"
          description="All leave requests have been reviewed. Check back later."
        />
      ) : (
        <div className="space-y-3">
          {leaves.map(l => {
            const initials = l.employeeName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'
            return (
              <div key={l.id} className="card hover:shadow-card-hover transition-shadow duration-200">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold shrink-0">
                    {initials}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-800">{l.employeeName}</p>
                      <LeaveTypeBadge type={l.leaveType} />
                      <StatusBadge status={l.status} />
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {l.startDate} → {l.endDate}
                      <span className="mx-1 text-slate-300">·</span>
                      <span className="font-semibold text-slate-600">{l.totalDays} day{l.totalDays !== 1 ? 's' : ''}</span>
                    </p>
                    {l.reason && <p className="text-xs text-slate-400 mt-1 truncate">{l.reason}</p>}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDetailLeave(l)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => { setActionLeave({ leave: l, action: 'approve' }); setRemarks('') }}
                      className="btn-success text-sm px-3 py-2"
                    >
                      <CheckCircle2 size={15} /> Approve
                    </button>
                    <button
                      onClick={() => { setActionLeave({ leave: l, action: 'reject' }); setRemarks('') }}
                      className="btn-reject text-sm px-3 py-2"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Approve/Reject Modal */}
      <Modal
        open={!!actionLeave}
        onClose={() => setActionLeave(null)}
        title={actionLeave?.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        size="sm"
      >
        {actionLeave && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${actionLeave.action === 'approve' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-sm font-semibold text-slate-700">{actionLeave.leave.employeeName}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {actionLeave.leave.leaveType} · {actionLeave.leave.startDate} → {actionLeave.leave.endDate} · {actionLeave.leave.totalDays} days
              </p>
            </div>
            <div>
              <label className="label">Remarks {actionLeave.action === 'reject' && <span className="text-red-400">*</span>}</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder={actionLeave.action === 'approve' ? 'Optional remarks…' : 'Reason for rejection…'}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActionLeave(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={submitAction}
                disabled={submitting || (actionLeave.action === 'reject' && !remarks.trim())}
                className={`flex-1 ${actionLeave.action === 'approve' ? 'btn-success' : 'btn-reject'}`}
              >
                {submitting ? 'Processing…' : actionLeave.action === 'approve' ? '✓ Approve' : '✗ Reject'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
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
                ['Total Days', `${detailLeave.totalDays} day${detailLeave.totalDays !== 1 ? 's' : ''}`],
                ['Applied On', detailLeave.appliedOn],
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
            <div className="flex gap-3">
              <button
                onClick={() => { setDetailLeave(null); setActionLeave({ leave: detailLeave, action: 'approve' }); setRemarks('') }}
                className="btn-success flex-1"
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button
                onClick={() => { setDetailLeave(null); setActionLeave({ leave: detailLeave, action: 'reject' }); setRemarks('') }}
                className="btn-reject flex-1"
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
