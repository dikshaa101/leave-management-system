import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, CalendarCheck2, Clock, Calendar,
  UserCircle2, LogOut, Menu, X, ChevronDown, Building2, CheckSquare
} from 'lucide-react'

const employeeNav = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/leaves',       label: 'My Leaves',    icon: Calendar },
  { to: '/leaves/apply', label: 'Apply Leave',  icon: CalendarCheck2 },
  { to: '/profile',      label: 'My Profile',   icon: UserCircle2 },
]

const managerNav = [
  { to: '/dashboard',         label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/employees',         label: 'Employees',        icon: Users },
  { to: '/pending-leaves',    label: 'Pending Leaves',   icon: Clock },
  { to: '/all-leaves',        label: 'All Leaves',       icon: Calendar },
  { to: '/team-availability', label: 'Team Availability',icon: Building2 },
  { to: '/profile',           label: 'My Profile',       icon: UserCircle2 },
]

export default function Layout() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)

  const nav = role === 'MANAGER' ? managerNav : employeeNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : '?'

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-white border-r border-slate-100 shadow-sm transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <CheckSquare size={20} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg leading-tight">LeaveFlow</span>
            <p className="text-xs text-slate-400 font-medium">
              {role === 'MANAGER' ? 'Manager Portal' : 'Employee Portal'}
            </p>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 [&>svg]:text-primary-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.fullName || 'Loading…'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.department || role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100 h-16 flex items-center px-4 lg:px-8 gap-4">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="flex-1" />

          {/* Role badge */}
          <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
            role === 'MANAGER'
              ? 'bg-accent-100 text-accent-700'
              : 'bg-primary-100 text-primary-700'
          }`}>
            {role}
          </span>

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdown(p => !p)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <ChevronDown size={14} className="hidden sm:block" />
            </button>
            {profileDropdown && (
              <div className="absolute right-0 top-12 bg-white border border-slate-100 rounded-2xl shadow-card-hover w-52 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setProfileDropdown(false); navigate('/profile') }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  View Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
