import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/Spinner'
import { UserCircle2, Mail, Phone, Building2, Briefcase, Calendar, TrendingUp, Edit2, Check, X } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, role, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        designation: user.designation || '',
        joiningDate: user.joiningDate || '',
      })
    }
  }, [user])

  if (!user || !form) return <PageLoader />

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const saveProfile = async () => {
    setSaving(true)
    try {
      await api.put(`/employee/${user.id}`, form)
      await refreshProfile()
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const infoItems = [
    { icon: Mail,      label: 'Email',       value: user.email,       name: 'email',       type: 'email' },
    { icon: Phone,     label: 'Phone',       value: user.phone,       name: 'phone',       type: 'tel' },
    { icon: Building2, label: 'Department',  value: user.department,  name: 'department',  type: 'text' },
    { icon: Briefcase, label: 'Designation', value: user.designation, name: 'designation', type: 'text' },
    { icon: Calendar,  label: 'Joining Date',value: user.joiningDate, name: 'joiningDate', type: 'date' },
  ]

  const usedLeave = 20 - (user.leaveBalance || 0)
  const balancePct = ((user.leaveBalance || 0) / 20) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Header card */}
      <div className="card bg-gradient-to-r from-primary-600 to-accent-600 text-white border-0">
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-extrabold">
            {initials}
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                className="input text-xl font-bold bg-white/20 border-white/30 text-white placeholder-white/60 focus:ring-white/40"
                name="fullName"
                value={form.fullName}
                onChange={handle}
              />
            ) : (
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
            )}
            <p className="text-primary-200 mt-1">{user.designation} · {user.department}</p>
            <span className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
              role === 'MANAGER' ? 'bg-white/25 text-white' : 'bg-white/20 text-white'
            }`}>
              {role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={saveProfile} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-white text-primary-700 rounded-xl font-semibold text-sm hover:bg-primary-50 transition-all">
                  {saving ? '…' : <><Check size={16} /> Save</>}
                </button>
                <button onClick={() => setEditing(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <X size={18} />
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-sm transition-all">
                <Edit2 size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Leave balance */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Leave Balance</h2>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-500" />
            <span className="text-2xl font-bold text-primary-600">{user.leaveBalance}</span>
            <span className="text-slate-400 text-sm">/ 20 days</span>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-700"
            style={{ width: `${Math.min(balancePct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-xs text-slate-400">{usedLeave} days used</p>
          <p className="text-xs text-slate-400">{user.leaveBalance} days remaining</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Annual Allocation', value: 20, color: 'bg-primary-50 text-primary-700' },
            { label: 'Used',              value: usedLeave, color: 'bg-rose-50 text-rose-700' },
            { label: 'Remaining',         value: user.leaveBalance, color: 'bg-emerald-50 text-emerald-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl p-3 text-center ${color}`}>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-800 mb-5">Personal Information</h2>
        <div className="space-y-4">
          {infoItems.map(({ icon: Icon, label, value, name, type }) => (
            <div key={name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                {editing ? (
                  <input
                    className="input mt-1 py-1.5 text-sm"
                    type={type}
                    name={name}
                    value={form[name] || ''}
                    onChange={handle}
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{value || '—'}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
