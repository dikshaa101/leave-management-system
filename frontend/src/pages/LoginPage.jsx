import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, CheckSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const token = res.data.token
      // Determine role by trying to access a manager-only endpoint
      let role = 'EMPLOYEE'
      try {
        await api.get('/manager/leaves/pending', {
          headers: { Authorization: `Bearer ${token}` },
        })
        role = 'MANAGER'
      } catch (_) {}

      login(token, role)
      toast.success(`Welcome back! Signed in as ${role === 'MANAGER' ? 'Manager' : 'Employee'}`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Invalid credentials'
      toast.error(typeof msg === 'string' ? msg : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckSquare size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold">LeaveFlow</span>
        </div>
        <div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Manage leaves<br />with confidence.
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed max-w-md">
            A streamlined platform for employees to apply for leave and managers to review, approve, and track team availability — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[['20+', 'Leave days/year'], ['Real-time', 'Team visibility'], ['Instant', 'Approvals']].map(([val, label]) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-primary-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-primary-300 text-sm">© 2025 LeaveFlow. Built with Spring Boot + React.</p>
      </div>

      {/* Right form panel */}
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
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Sign in</h2>
              <p className="text-slate-500 mt-1">Welcome back — let's get you in</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">Username</label>
                <input
                  className="input"
                  type="text"
                  name="username"
                  placeholder="your_username"
                  value={form.username}
                  onChange={handle}
                  autoFocus
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input pr-12"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handle}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
