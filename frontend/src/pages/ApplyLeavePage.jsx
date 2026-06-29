import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { CalendarCheck2, ArrowLeft, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LEAVE_TYPES = ['CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY']

const LEAVE_DESCRIPTIONS = {
  CASUAL:    'For personal errands or short-term personal needs.',
  SICK:      'When you are unwell or need medical attention.',
  EARNED:    'Paid leave earned through your tenure.',
  MATERNITY: 'For new mothers around childbirth.',
  PATERNITY: 'For new fathers around childbirth.',
}

export default function ApplyLeavePage() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0
    const s = new Date(form.startDate)
    const e = new Date(form.endDate)
    if (e < s) return 0
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
    return Math.max(diff, 0)
  }

  const totalDays = calcDays()

  const submit = async (e) => {
    e.preventDefault()
    if (!form.startDate || !form.endDate) {
      toast.error('Please select start and end dates')
      return
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date cannot be before start date')
      return
    }
    if (totalDays > (user?.leaveBalance || 0)) {
      toast.error(`Insufficient balance. You have ${user?.leaveBalance} days available.`)
      return
    }
    setLoading(true)
    try {
      await api.post('/leave/apply', { ...form, totalDays })
      toast.success('Leave request submitted successfully!')
      await refreshProfile()
      navigate('/leaves')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to apply for leave'
      toast.error(typeof msg === 'string' ? msg : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/leaves" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl p-2 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Apply for Leave</h1>
          <p className="text-slate-500 text-sm">Submit a new leave request</p>
        </div>
      </div>

      {/* Balance banner */}
      {user && (
        <div className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Info size={18} className="text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-800">Leave Balance</p>
            <p className="text-xs text-primary-600">You have <strong>{user.leaveBalance} days</strong> remaining out of 20 annual days.</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-primary-600">{user.leaveBalance}</p>
            <p className="text-xs text-primary-500">days left</p>
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={submit} className="space-y-6">
          {/* Leave type */}
          <div>
            <label className="label">Leave Type <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {LEAVE_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, leaveType: type }))}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                    form.leaveType === type
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold">{type}</p>
                  <p className="text-xs mt-0.5 opacity-70 leading-tight">{LEAVE_DESCRIPTIONS[type]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date <span className="text-red-400">*</span></label>
              <input
                className="input"
                type="date"
                name="startDate"
                value={form.startDate}
                min={today}
                onChange={handle}
                required
              />
            </div>
            <div>
              <label className="label">End Date <span className="text-red-400">*</span></label>
              <input
                className="input"
                type="date"
                name="endDate"
                value={form.endDate}
                min={form.startDate || today}
                onChange={handle}
                required
              />
            </div>
          </div>

          {/* Days summary */}
          {totalDays > 0 && (
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              totalDays > (user?.leaveBalance || 0)
                ? 'bg-red-50 border-red-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <span className={`text-sm font-medium ${totalDays > (user?.leaveBalance || 0) ? 'text-red-700' : 'text-emerald-700'}`}>
                Duration
              </span>
              <span className={`text-lg font-bold ${totalDays > (user?.leaveBalance || 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                {totalDays} day{totalDays !== 1 ? 's' : ''}
                {totalDays > (user?.leaveBalance || 0) && <span className="text-xs font-medium ml-2">(Exceeds balance)</span>}
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="label">Reason</label>
            <textarea
              className="input resize-none"
              name="reason"
              placeholder="Briefly describe the reason for your leave…"
              value={form.reason}
              onChange={handle}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.reason.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link to="/leaves" className="btn-secondary flex-1">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || totalDays === 0}
              className="btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : (
                <>
                  <CalendarCheck2 size={18} />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
