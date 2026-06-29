import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { PageLoader } from '../components/Spinner'
import { Users, CheckCircle2, XCircle, Calendar, Building2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['', 'Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Design', 'Product']

export default function TeamAvailabilityPage() {
  const [mode, setMode] = useState('today')   // 'today' | 'date' | 'department'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [department, setDepartment] = useState('')
  const [availability, setAvailability] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchAvailability() }, [])

  const fetchAvailability = async () => {
    setLoading(true)
    setAvailability(null)
    try {
      let res
      if (mode === 'today') {
        res = await api.get('/team/availability/today')
      } else if (mode === 'date') {
        res = await api.get(`/team/availability/date?date=${selectedDate}`)
      } else {
        if (!department) { toast.error('Please select a department'); setLoading(false); return }
        res = await api.get(`/team/availability/department?department=${encodeURIComponent(department)}&date=${selectedDate}`)
      }
      setAvailability(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch availability')
    } finally { setLoading(false) }
  }

  const availablePct = availability
    ? Math.round((availability.availableEmployees / (availability.totalEmployees || 1)) * 100)
    : 0

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Team Availability</h1>
        <p className="text-slate-500 text-sm mt-0.5">{today}</p>
      </div>

      {/* Query builder */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-700">Check Availability</h2>

        {/* Mode tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'today',      label: "Today's Availability" },
            { value: 'date',       label: 'By Date' },
            { value: 'department', label: 'By Department' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                mode === value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Controls */}
        {(mode === 'date' || mode === 'department') && (
          <div className="flex flex-wrap gap-4 items-end">
            {(mode === 'date' || mode === 'department') && (
              <div>
                <label className="label text-xs">Date</label>
                <input
                  className="input"
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
            )}
            {mode === 'department' && (
              <div>
                <label className="label text-xs">Department</label>
                <select className="input" value={department} onChange={e => setDepartment(e.target.value)}>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d || 'Select department…'}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <button onClick={fetchAvailability} disabled={loading} className="btn-primary">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading…
            </span>
          ) : (
            <>
              <RefreshCw size={16} />
              {mode === 'today' ? 'Refresh' : 'Check Availability'}
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {loading && !availability && <PageLoader />}

      {availability && (
        <div className="space-y-6 animate-slide-up">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <Users size={22} className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{availability.totalEmployees}</p>
                <p className="text-sm text-slate-500 font-medium">Total Employees</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{availability.availableEmployees}</p>
                <p className="text-sm text-slate-500 font-medium">Available</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
                <XCircle size={22} className="text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{availability.employeesOnLeave}</p>
                <p className="text-sm text-slate-500 font-medium">On Leave</p>
              </div>
            </div>
          </div>

          {/* Gauge */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">Team Availability Rate</h3>
              <span className={`text-2xl font-extrabold ${
                availablePct >= 80 ? 'text-emerald-600' : availablePct >= 50 ? 'text-amber-500' : 'text-red-500'
              }`}>{availablePct}%</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  availablePct >= 80
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    : availablePct >= 50
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${availablePct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>0%</span>
              <span className={`font-semibold ${availablePct >= 80 ? 'text-emerald-500' : availablePct >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {availablePct >= 80 ? 'Fully staffed' : availablePct >= 50 ? 'Adequate coverage' : 'Low coverage'}
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Employee lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Available */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800">Available ({availability.availableEmployees})</h3>
              </div>
              {(availability.availableEmployeeNames || []).length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No employees available</p>
              ) : (
                <div className="space-y-2">
                  {availability.availableEmployeeNames.map((name, i) => {
                    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2)
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{name}</span>
                        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* On Leave */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                  <XCircle size={16} className="text-rose-500" />
                </div>
                <h3 className="font-bold text-slate-800">On Leave ({availability.employeesOnLeave})</h3>
              </div>
              {(availability.employeesOnLeaveNames || []).length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No employees on leave</p>
              ) : (
                <div className="space-y-2">
                  {availability.employeesOnLeaveNames.map((name, i) => {
                    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2)
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-rose-50/60 hover:bg-rose-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{name}</span>
                        <span className="ml-auto w-2 h-2 rounded-full bg-rose-500" />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
