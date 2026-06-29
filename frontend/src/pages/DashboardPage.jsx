import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import LeaveTypeBadge from '../components/LeaveTypeBadge'
import { PageLoader } from '../components/Spinner'
import {
  Calendar, Clock, CheckCircle2, XCircle, Users,
  TrendingUp, ArrowRight, CalendarCheck2, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, role } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [role])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      if (role === 'MANAGER') {
        const [empRes, pendingRes, allLeavesRes] = await Promise.all([
          api.get('/employee'),
          api.get('/manager/leaves/pending'),
          api.get('/leave/all'),
        ])
        setData({
          employees: empRes.data.data,
          pending: pendingRes.data.data,
          allLeaves: allLeavesRes.data.data,
        })
      } else {
        const leavesRes = await api.get('/leave/my-leaves')
        const leaves = leavesRes.data.data || []
        setData({ leaves })
      }
    } catch (_) {}
    finally { setLoading(false) }
  }

  if (loading) return <PageLoader />

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  /* ─── EMPLOYEE DASHBOARD ─── */
  if (role === 'EMPLOYEE') {
    const leaves = data?.leaves || []
    const pending = leaves.filter(l => l.status === 'PENDING').length
    const approved = leaves.filter(l => l.status === 'APPROVED').length
    const rejected = leaves.filter(l => l.status === 'REJECTED').length
    const balance = user?.leaveBalance ?? 0

    const recent = [...leaves].sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)).slice(0, 5)

    return (
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-slate-500 text-sm font-medium">{greeting()},</p>
            <h1 className="text-3xl font-bold text-slate-800">{user?.fullName} 👋</h1>
            <p className="text-slate-500 mt-1">{user?.designation} · {user?.department}</p>
          </div>
          <Link to="/leaves/apply" className="btn-primary">
            <CalendarCheck2 size={18} />
            Apply for Leave
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp}    label="Leave Balance"    value={balance}   color="text-primary-600"  bg="bg-primary-50" />
          <StatCard icon={Clock}         label="Pending"          value={pending}   color="text-amber-600"    bg="bg-amber-50" />
          <StatCard icon={CheckCircle2}  label="Approved"         value={approved}  color="text-emerald-600"  bg="bg-emerald-50" />
          <StatCard icon={XCircle}       label="Rejected"         value={rejected}  color="text-red-500"      bg="bg-red-50" />
        </div>

        {/* Recent leaves */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Leave Requests</h2>
            <Link to="/leaves" className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar size={40} className="mx-auto mb-3 opacity-40" />
              <p>No leave requests yet.</p>
              <Link to="/leaves/apply" className="text-primary-600 text-sm font-medium hover:underline mt-1 inline-block">Apply your first leave</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(l => (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <LeaveTypeBadge type={l.leaveType} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{l.reason || 'No reason provided'}</p>
                      <p className="text-xs text-slate-400">
                        {l.startDate} → {l.endDate} · {l.totalDays} day{l.totalDays !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave balance progress */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Leave Balance Overview</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Available Balance</span>
            <span className="text-sm font-bold text-primary-600">{balance} / 20 days</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min((balance / 20) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{20 - balance} days used out of 20 annual days</p>
        </div>
      </div>
    )
  }

  /* ─── MANAGER DASHBOARD ─── */
  const employees = data?.employees || []
  const pending = data?.pending || []
  const allLeaves = data?.allLeaves || []
  const approved = allLeaves.filter(l => l.status === 'APPROVED').length
  const recentPending = pending.slice(0, 5)

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm font-medium">{greeting()},</p>
          <h1 className="text-3xl font-bold text-slate-800">{user?.fullName} 👋</h1>
          <p className="text-slate-500 mt-1">Manager · {user?.department}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/employees" className="btn-secondary">
            <Users size={16} />
            Employees
          </Link>
          <Link to="/pending-leaves" className="btn-primary">
            <Clock size={16} />
            Pending Leaves {pending.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{pending.length}</span>}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Total Employees"  value={employees.length} color="text-primary-600"  bg="bg-primary-50" />
        <StatCard icon={Clock}         label="Pending Reviews"  value={pending.length}   color="text-amber-600"    bg="bg-amber-50" />
        <StatCard icon={CheckCircle2}  label="Approved Leaves"  value={approved}         color="text-emerald-600"  bg="bg-emerald-50" />
        <StatCard icon={Calendar}      label="Total Requests"   value={allLeaves.length} color="text-violet-600"   bg="bg-violet-50" />
      </div>

      {/* Pending leaves needing action */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Pending Approvals</h2>
            {pending.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
            )}
          </div>
          <Link to="/pending-leaves" className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
            Review all <ArrowRight size={14} />
          </Link>
        </div>
        {recentPending.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-40" />
            <p>No pending leave requests. All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPending.map(l => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {l.employeeName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{l.employeeName}</p>
                    <p className="text-xs text-slate-400">
                      <LeaveTypeBadge type={l.leaveType} /> · {l.startDate} → {l.endDate} · {l.totalDays} day{l.totalDays !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  <StatusBadge status={l.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/team-availability', icon: Users, label: 'Team Availability', desc: "See who's in today", color: 'bg-violet-50 text-violet-600' },
          { to: '/all-leaves', icon: Calendar, label: 'All Leaves', desc: 'Browse all leave history', color: 'bg-blue-50 text-blue-600' },
          { to: '/employees', icon: TrendingUp, label: 'Manage Employees', desc: 'Add, edit, or remove staff', color: 'bg-emerald-50 text-emerald-600' },
        ].map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to} className="card hover:shadow-card-hover transition-shadow duration-200 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${color.split(' ')[0]} flex items-center justify-center shrink-0`}>
              <Icon size={20} className={color.split(' ')[1]} />
            </div>
            <div>
              <p className="font-semibold text-slate-700">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  )
}
