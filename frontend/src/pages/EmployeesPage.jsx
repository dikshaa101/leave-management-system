import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import Modal from '../components/Modal'
import { PageLoader } from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import toast from 'react-hot-toast'
import { UserPlus, Edit2, Trash2, Search, Mail, Phone, Building2, Briefcase, TrendingUp } from 'lucide-react'

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Design', 'Product']
const EMPTY_FORM = { fullName: '', email: '', phone: '', department: '', designation: '', joiningDate: '' }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchDept, setSearchDept] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editEmployee, setEditEmployee] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchEmployees() }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await api.get('/employee')
      setEmployees(res.data.data || [])
    } catch (_) { toast.error('Failed to load employees') }
    finally { setLoading(false) }
  }

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const openAdd = () => { setForm(EMPTY_FORM); setShowAddModal(true) }
  const openEdit = (emp) => {
    setEditEmployee(emp)
    setForm({
      fullName: emp.fullName, email: emp.email, phone: emp.phone,
      department: emp.department, designation: emp.designation,
      joiningDate: emp.joiningDate || '',
    })
  }

  const saveEmployee = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email) { toast.error('Name and email are required'); return }
    setSaving(true)
    try {
      if (editEmployee) {
        await api.put(`/employee/${editEmployee.id}`, form)
        toast.success('Employee updated')
        setEditEmployee(null)
      } else {
        await api.post('/employee', form)
        toast.success('Employee added')
        setShowAddModal(false)
      }
      fetchEmployees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const deleteEmployee = async () => {
    setDeleting(true)
    try {
      await api.delete(`/employee/${deleteId}`)
      toast.success('Employee removed')
      setDeleteId(null)
      fetchEmployees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally { setDeleting(false) }
  }

  const filtered = searchDept
    ? employees.filter(e => e.department?.toLowerCase().includes(searchDept.toLowerCase()) || e.fullName?.toLowerCase().includes(searchDept.toLowerCase()))
    : employees

  if (loading) return <PageLoader />

  const EmployeeForm = () => (
    <form onSubmit={saveEmployee} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Full Name <span className="text-red-400">*</span></label>
          <input className="input" name="fullName" placeholder="Jane Smith" value={form.fullName} onChange={handle} />
        </div>
        <div className="col-span-2">
          <label className="label">Email <span className="text-red-400">*</span></label>
          <input className="input" type="email" name="email" placeholder="jane@company.com" value={form.email} onChange={handle} />
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
          <input className="input" name="designation" placeholder="Software Engineer" value={form.designation} onChange={handle} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => { setShowAddModal(false); setEditEmployee(null) }} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving…' : editEmployee ? 'Save Changes' : 'Add Employee'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-slate-500 text-sm mt-0.5">{employees.length} total employees</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <UserPlus size={18} /> Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Search by name or department…"
          value={searchDept}
          onChange={e => setSearchDept(e.target.value)}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState title="No employees found" description="Add your first employee to get started." action={<button onClick={openAdd} className="btn-primary"><UserPlus size={16} /> Add Employee</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => {
            const initials = emp.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
            const balancePct = ((emp.leaveBalance || 0) / 20) * 100
            return (
              <div key={emp.id} className="card hover:shadow-card-hover transition-shadow duration-200 space-y-4">
                {/* Top */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{emp.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{emp.designation}</p>
                    <span className="inline-flex px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full mt-1">
                      {emp.department}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={12} className="shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>

                {/* Leave balance */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Leave Balance</span>
                    <span className="font-bold text-primary-600">{emp.leaveBalance}/20</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full" style={{ width: `${balancePct}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => openEdit(emp)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(emp.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Employee">
        <EmployeeForm />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editEmployee} onClose={() => setEditEmployee(null)} title="Edit Employee">
        <EmployeeForm />
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Employee" size="sm">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to remove this employee? All associated data will be deleted.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={deleteEmployee} disabled={deleting} className="btn-danger flex-1">
              {deleting ? 'Removing…' : 'Yes, Remove'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
