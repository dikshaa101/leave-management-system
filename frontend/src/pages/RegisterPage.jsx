import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, CheckSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Design', 'Product']
const ROLES = ['EMPLOYEE', 'MANAGER']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '', password: '', role: 'EMPLOYEE',
    fullName: '', email: '', phone: '',
    department: '', designation: '', joiningDate: '',
  })

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const nextStep = (e) => {
    e.preventDefault()
    if (!form.username || !form.password || !form.role) {
      toast.error('Please fill in all required fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setStep(2)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email) {
      toast.error('Full name and email are required')
      return
    }
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.joiningDate) delete payload.joiningDate
      await api.post('/auth/register', payload)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed'
      toast.error(typeof msg === 'string' ? msg : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-accent-700 via-primary-700 to-primary-600 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckSquare size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold">LeaveFlow</span>
        </div>
        <div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Join the team<br />in minutes.
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed max-w-md">
            Create your account as an employee or manager. Get instant access to leave management, team visibility, and approval workflows.
          </p>
          <div className="mt-10 flex gap-4">
            <div className="bg-white/10 rounded-2xl p-5 flex-1">
              <p className="text-xl font-bold">Employee</p>
              <p className="text-primary-200 text-sm mt-1">Apply for leaves and track your balance</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-5 flex-1">
              <p className="text-xl font-bold">Manager</p>
              <p className="text-primary-200 text-sm mt-1">Review teams and approve leave requests</p>
            </div>
          </div>
        </div>
        <p className="text-primary-300 text-sm">© 2025 LeaveFlow. All rights reserved.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <CheckSquare size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">LeaveFlow</span>
          </div>

          <div className="card shadow-card-hover">
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {step === 1 ? 'Create account' : 'Your details'}
              </h2>
              <p className="text-slate-500 mt-1">
                {step === 1 ? 'Step 1: Account credentials' : 'Step 2: Personal information'}
              </p>
            </div>

            {step === 1 ? (
              <form onSubmit={nextStep} className="space-y-5">
                <div>
                  <label className="label">Username <span className="text-red-400">*</span></label>
                  <input className="input" type="text" name="username" placeholder="john_doe" value={form.username} onChange={handle} autoFocus />
                </div>
                <div>
                  <label className="label">Password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input
                      className="input pr-12"
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={handle}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Role <span className="text-red-400">*</span></label>
                  <select className="input" name="role" value={form.role} onChange={handle}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full mt-2">
                  Continue
                </button>
              </form>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Full Name <span className="text-red-400">*</span></label>
                    <input className="input" type="text" name="fullName" placeholder="John Doe" value={form.fullName} onChange={handle} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Email <span className="text-red-400">*</span></label>
                    <input className="input" type="email" name="email" placeholder="john@company.com" value={form.email} onChange={handle} />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" type="tel" name="phone" placeholder="+1 234 567 8900" value={form.phone} onChange={handle} />
                  </div>
                  <div>
                    <label className="label">Joining Date</label>
                    <input className="input" type="date" name="joiningDate" value={form.joiningDate} onChange={handle} />
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <select className="input" name="department" value={form.department} onChange={handle}>
                      <option value="">Select…</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Designation</label>
                    <input className="input" type="text" name="designation" placeholder="Software Engineer" value={form.designation} onChange={handle} />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating…
                      </span>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
