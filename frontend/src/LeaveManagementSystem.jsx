import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API = "http://localhost:8080";

const api = async (path, opts = {}, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

// ─── ICONS (inline SVG) ─────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const icons = {
    logo: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    leave: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    pending: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    team: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    profile: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  };
  return icons[name] || null;
};

// ─── TOAST ──────────────────────────────────────────────────────────────────
const Toast = ({ toasts, remove }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
        borderRadius: 10, minWidth: 280, maxWidth: 380,
        background: t.type === "error" ? "#fef2f2" : t.type === "warning" ? "#fffbeb" : "#f0fdf4",
        border: `1px solid ${t.type === "error" ? "#fecaca" : t.type === "warning" ? "#fde68a" : "#bbf7d0"}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)", animation: "slideIn 0.2s ease",
        fontSize: 14, color: t.type === "error" ? "#991b1b" : t.type === "warning" ? "#92400e" : "#166534"
      }}>
        <Icon name={t.type === "error" ? "x" : "check"} size={16} color={t.type === "error" ? "#ef4444" : "#22c55e"} />
        <span style={{ flex: 1 }}>{t.message}</span>
        <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", opacity: 0.6 }}>
          <Icon name="x" size={14} />
        </button>
      </div>
    ))}
  </div>
);

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };
  const remove = id => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, success: m => add(m, "success"), error: m => add(m, "error"), remove };
};

// ─── MODAL ──────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      padding: 20, backdropFilter: "blur(4px)"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: width,
        maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#0f172a" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

// ─── FORM COMPONENTS ────────────────────────────────────────────────────────
const Field = ({ label, error, required, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
      {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{error}</p>}
  </div>
);

const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8,
  fontSize: 14, color: "#111827", background: "#fff", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s"
};

const Input = ({ ...props }) => (
  <input {...props} style={{ ...inputStyle, ...(props.style || {}) }}
    onFocus={e => e.target.style.borderColor = "#6366f1"}
    onBlur={e => e.target.style.borderColor = "#d1d5db"} />
);

const Select = ({ children, ...props }) => (
  <select {...props} style={{ ...inputStyle, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", ...(props.style || {}) }}
    onFocus={e => e.target.style.borderColor = "#6366f1"}
    onBlur={e => e.target.style.borderColor = "#d1d5db"}>
    {children}
  </select>
);

const Textarea = ({ ...props }) => (
  <textarea {...props} rows={3} style={{ ...inputStyle, resize: "vertical", ...(props.style || {}) }}
    onFocus={e => e.target.style.borderColor = "#6366f1"}
    onBlur={e => e.target.style.borderColor = "#d1d5db"} />
);

// ─── BUTTONS ────────────────────────────────────────────────────────────────
const Btn = ({ children, variant = "primary", size = "md", loading, icon, ...props }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 8,
    fontWeight: 500, cursor: props.disabled || loading ? "not-allowed" : "pointer",
    border: "none", transition: "all 0.15s", outline: "none",
    padding: size === "sm" ? "6px 12px" : size === "lg" ? "12px 24px" : "9px 18px",
    fontSize: size === "sm" ? 13 : 14,
    opacity: (props.disabled || loading) ? 0.6 : 1,
  };
  const variants = {
    primary: { background: "#6366f1", color: "#fff" },
    secondary: { background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0" },
    danger: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
    success: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" },
    ghost: { background: "transparent", color: "#6366f1" },
  };
  return (
    <button {...props} disabled={props.disabled || loading} style={{ ...base, ...variants[variant], ...(props.style || {}) }}>
      {loading ? <span style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> : icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
};

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    PENDING: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    APPROVED: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    REJECTED: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    CANCELLED: { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
    MANAGER: { bg: "#ede9fe", color: "#7c3aed", border: "#ddd6fe" },
    EMPLOYEE: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, letterSpacing: "0.02em"
    }}>{status}</span>
  );
};

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "#6366f1", icon }) => (
  <div style={{
    background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "20px 24px",
    display: "flex", alignItems: "flex-start", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
  }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={icon} size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: color, marginTop: 2, fontWeight: 500 }}>{sub}</div>}
    </div>
  </div>
);

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
const Empty = ({ icon, title, desc }) => (
  <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8" }}>
    <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
      <Icon name={icon} size={24} color="#cbd5e1" />
    </div>
    <div style={{ fontSize: 15, fontWeight: 600, color: "#64748b" }}>{title}</div>
    {desc && <div style={{ fontSize: 13, marginTop: 4 }}>{desc}</div>}
  </div>
);

// ─── TABLE ───────────────────────────────────────────────────────────────────
const Table = ({ cols, rows, emptyIcon = "leave", emptyText = "No records found" }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
          {cols.map(c => (
            <th key={c.key} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap", letterSpacing: "0.03em" }}>{c.label.toUpperCase()}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={cols.length}><Empty icon={emptyIcon} title={emptyText} /></td></tr>
        ) : rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
            onMouseLeave={e => e.currentTarget.style.background = ""}>
            {cols.map(c => (
              <td key={c.key} style={{ padding: "12px 16px", color: "#374151", whiteSpace: c.wrap ? "normal" : "nowrap" }}>
                {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
const Card = ({ title, actions, children, noPad }) => (
  <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
    {title && (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f8fafc" }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{title}</h3>
        {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
      </div>
    )}
    <div style={noPad ? {} : { padding: "0" }}>{children}</div>
  </div>
);

// ─── LOADING ─────────────────────────────────────────────────────────────────
const Spinner = ({ size = 32 }) => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
    <div style={{ width: size, height: size, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
  </div>
);

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const Sidebar = ({ role, active, setActive, onLogout, profile }) => {
  const employeeNav = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "my-leaves", label: "My Leaves", icon: "leave" },
    { id: "apply-leave", label: "Apply Leave", icon: "plus" },
    { id: "profile", label: "My Profile", icon: "profile" },
  ];
  const managerNav = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "employees", label: "Employees", icon: "users" },
    { id: "all-leaves", label: "All Leaves", icon: "leave" },
    { id: "pending", label: "Pending Requests", icon: "pending" },
    { id: "team-availability", label: "Team Availability", icon: "team" },
  ];
  const nav = role === "MANAGER" ? managerNav : employeeNav;

  return (
    <aside style={{
      width: 240, flexShrink: 0, background: "#0f172a", display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="logo" size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.01em" }}>LeaveSync</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>Management Portal</div>
          </div>
        </div>
      </div>

      {/* Profile pill */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {profile?.fullName?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.fullName || "Loading..."}</div>
            <div style={{ marginTop: 2 }}><Badge status={role} /></div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
        {nav.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              marginBottom: 2, textAlign: "left", transition: "all 0.15s",
              background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
              color: isActive ? "#a5b4fc" : "#94a3b8",
              fontWeight: isActive ? 600 : 400, fontSize: 14,
            }}>
              <Icon name={item.icon} size={16} color={isActive ? "#a5b4fc" : "#64748b"} />
              {item.label}
              {isActive && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#6366f1" }} />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={onLogout} style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
          background: "transparent", color: "#64748b", fontSize: 14, textAlign: "left",
          transition: "all 0.15s"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}>
          <Icon name="logout" size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

// ─── AUTH PAGE ───────────────────────────────────────────────────────────────
const AuthPage = ({ onAuth, toast }) => {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "EMPLOYEE", fullName: "", email: "", phone: "", department: "", designation: "", joiningDate: "" });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    try {
      if (tab === "login") {
        const res = await api("/auth/login", { method: "POST", body: JSON.stringify({ username: form.username, password: form.password }) });
        onAuth(res.token);
      } else {
        const payload = { username: form.username, password: form.password, role: form.role, fullName: form.fullName, email: form.email };
        if (form.phone) payload.phone = form.phone;
        if (form.department) payload.department = form.department;
        if (form.designation) payload.designation = form.designation;
        if (form.joiningDate) payload.joiningDate = form.joiningDate;
        await api("/auth/register", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Account created! Sign in now.");
        setTab("login");
      }
    } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Icon name="logo" size={26} color="#fff" />
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.03em" }}>LeaveSync</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Workforce leave management portal</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          {/* Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f1f5f9" }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "16px", border: "none", background: tab === t ? "#fff" : "#f8fafc", cursor: "pointer",
                fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? "#6366f1" : "#94a3b8",
                borderBottom: tab === t ? "2px solid #6366f1" : "2px solid transparent", transition: "all 0.15s"
              }}>
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div style={{ padding: 28 }}>
            <Field label="Username" required>
              <Input placeholder="Enter your username" value={form.username} onChange={set("username")} onKeyDown={e => e.key === "Enter" && tab === "login" && submit()} />
            </Field>
            <Field label="Password" required>
              <Input type="password" placeholder="Enter your password" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && tab === "login" && submit()} />
            </Field>

            {tab === "register" && (
              <>
                <Field label="Full Name" required>
                  <Input placeholder="Your full name" value={form.fullName} onChange={set("fullName")} />
                </Field>
                <Field label="Email" required>
                  <Input type="email" placeholder="your@email.com" value={form.email} onChange={set("email")} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Phone">
                    <Input placeholder="+91 ..." value={form.phone} onChange={set("phone")} />
                  </Field>
                  <Field label="Role" required>
                    <Select value={form.role} onChange={set("role")}>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                    </Select>
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Department">
                    <Input placeholder="Engineering" value={form.department} onChange={set("department")} />
                  </Field>
                  <Field label="Designation">
                    <Input placeholder="Software Engineer" value={form.designation} onChange={set("designation")} />
                  </Field>
                </div>
                <Field label="Joining Date">
                  <Input type="date" value={form.joiningDate} onChange={set("joiningDate")} />
                </Field>
              </>
            )}

            <Btn variant="primary" size="lg" loading={loading} onClick={submit} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              {tab === "login" ? "Sign In" : "Create Account"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PAGES ────────────────────────────────────────────────────────────────────

// Employee Dashboard
const EmployeeDashboard = ({ token, setActive }) => {
  const [profile, setProfile] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api("/employee/profile", {}, token),
      api("/leave/my-leaves", {}, token),
    ]).then(([p, l]) => {
      setProfile(p.data);
      setLeaves(l.data || []);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  const pending = leaves.filter(l => l.status === "PENDING").length;
  const approved = leaves.filter(l => l.status === "APPROVED").length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
          Good day, {profile?.fullName?.split(" ")[0]} 👋
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Leave Balance" value={profile?.leaveBalance ?? "—"} sub="days remaining" color="#6366f1" icon="leave" />
        <StatCard label="Pending" value={pending} sub="awaiting approval" color="#f59e0b" icon="pending" />
        <StatCard label="Approved" value={approved} sub="this year" color="#22c55e" icon="check" />
        <StatCard label="Total Applied" value={leaves.length} sub="all time" color="#8b5cf6" icon="refresh" />
      </div>

      <Card title="Recent Leave Requests" actions={<Btn size="sm" icon="plus" onClick={() => setActive("apply-leave")}>Apply Leave</Btn>}>
        <Table
          cols={[
            { key: "leaveType", label: "Type" },
            { key: "startDate", label: "From" },
            { key: "endDate", label: "To" },
            { key: "totalDays", label: "Days", render: v => v || "—" },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
            { key: "managerRemarks", label: "Remarks", wrap: true, render: v => <span style={{ color: "#64748b" }}>{v || "—"}</span> },
          ]}
          rows={leaves.slice(0, 8)}
        />
      </Card>
    </div>
  );
};

// Manager Dashboard
const ManagerDashboard = ({ token, setActive }) => {
  const [stats, setStats] = useState({ employees: 0, pending: 0, today: null });
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Promise.all([
      api("/employee", {}, token),
      api("/manager/leaves/pending", {}, token),
      api(`/team/availability/today`, {}, token),
    ]).then(([e, p, t]) => {
      setStats({ employees: (e.data || []).length, pending: (p.data || []).length, today: t.data });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  const avail = stats.today;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Manager Dashboard</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Employees" value={stats.employees} color="#6366f1" icon="users" />
        <StatCard label="Pending Approvals" value={stats.pending} sub={stats.pending > 0 ? "action needed" : "all clear"} color="#f59e0b" icon="pending" />
        <StatCard label="Available Today" value={avail?.availableEmployees ?? "—"} sub="in office" color="#22c55e" icon="check" />
        <StatCard label="On Leave Today" value={avail?.employeesOnLeave ?? "—"} color="#ef4444" icon="leave" />
      </div>

      {avail && (avail.availableEmployeeNames?.length > 0 || avail.employeesOnLeaveNames?.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <Card title="Available Today">
            <div style={{ padding: "12px 16px" }}>
              {avail.availableEmployeeNames?.length === 0 ? (
                <Empty icon="users" title="No one available today" />
              ) : avail.availableEmployeeNames?.map(n => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ fontSize: 14, color: "#374151" }}>{n}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="On Leave Today">
            <div style={{ padding: "12px 16px" }}>
              {avail.employeesOnLeaveNames?.length === 0 ? (
                <Empty icon="check" title="Everyone is present" />
              ) : avail.employeesOnLeaveNames?.map(n => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                  <span style={{ fontSize: 14, color: "#374151" }}>{n}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div onClick={() => setActive("pending")} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 14, padding: 24, cursor: "pointer", color: "#fff" }}>
          <Icon name="pending" size={28} color="rgba(255,255,255,0.8)" />
          <div style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>Review Pending Requests</div>
          <div style={{ marginTop: 4, fontSize: 13, opacity: 0.8 }}>{stats.pending} awaiting your decision</div>
        </div>
        <div onClick={() => setActive("employees")} style={{ background: "linear-gradient(135deg,#0ea5e9,#0284c7)", borderRadius: 14, padding: 24, cursor: "pointer", color: "#fff" }}>
          <Icon name="users" size={28} color="rgba(255,255,255,0.8)" />
          <div style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>Manage Employees</div>
          <div style={{ marginTop: 4, fontSize: 13, opacity: 0.8 }}>{stats.employees} total employees</div>
        </div>
      </div>
    </div>
  );
};

// My Leaves (Employee)
const MyLeaves = ({ token, toast }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api("/leave/my-leaves", {}, token).then(r => setLeaves(r.data || [])).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    if (!confirm("Cancel this leave request?")) return;
    setCancelling(id);
    try {
      await api(`/leave/${id}`, { method: "DELETE" }, token);
      toast.success("Leave cancelled.");
      load();
    } catch (e) { toast.error(e.message); } finally { setCancelling(null); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>My Leave Requests</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{leaves.length} total requests</p>
        </div>
        <Btn icon="refresh" variant="secondary" onClick={load} size="sm">Refresh</Btn>
      </div>
      <Card>
        {loading ? <Spinner /> : (
          <Table
            cols={[
              { key: "leaveType", label: "Type" },
              { key: "startDate", label: "From" },
              { key: "endDate", label: "To" },
              { key: "totalDays", label: "Days", render: v => v || "—" },
              { key: "reason", label: "Reason", wrap: true, render: v => <span style={{ color: "#64748b", maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v || "—"}</span> },
              { key: "status", label: "Status", render: v => <Badge status={v} /> },
              { key: "managerRemarks", label: "Remarks", wrap: true, render: v => <span style={{ color: "#64748b" }}>{v || "—"}</span> },
              {
                key: "id", label: "Action", render: (id, row) => row.status === "PENDING" ? (
                  <Btn size="sm" variant="danger" loading={cancelling === id} onClick={() => cancel(id)}>Cancel</Btn>
                ) : null
              },
            ]}
            rows={leaves}
          />
        )}
      </Card>
    </div>
  );
};

// Apply Leave
const ApplyLeave = ({ token, toast }) => {
  const [form, setForm] = useState({ startDate: "", endDate: "", leaveType: "CASUAL", reason: "" });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.startDate || !form.endDate) { toast.error("Please select start and end dates."); return; }
    const start = new Date(form.startDate), end = new Date(form.endDate);
    if (end < start) { toast.error("End date must be after start date."); return; }
    const totalDays = Math.ceil((end - start) / 86400000) + 1;
    setLoading(true);
    try {
      await api("/leave/apply", { method: "POST", body: JSON.stringify({ ...form, totalDays }) }, token);
      toast.success("Leave applied successfully!");
      setForm({ startDate: "", endDate: "", leaveType: "CASUAL", reason: "" });
    } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  const totalDays = form.startDate && form.endDate ? Math.max(0, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1) : 0;

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Apply for Leave</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Submit a new leave request for approval</p>
      </div>
      <Card>
        <div style={{ padding: 24 }}>
          <Field label="Leave Type" required>
            <Select value={form.leaveType} onChange={set("leaveType")}>
              {["CASUAL", "SICK", "EARNED", "MATERNITY", "PATERNITY"].map(t => (
                <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()} Leave</option>
              ))}
            </Select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Start Date" required>
              <Input type="date" value={form.startDate} onChange={set("startDate")} min={new Date().toISOString().split("T")[0]} />
            </Field>
            <Field label="End Date" required>
              <Input type="date" value={form.endDate} onChange={set("endDate")} min={form.startDate || new Date().toISOString().split("T")[0]} />
            </Field>
          </div>
          {totalDays > 0 && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="alert" size={16} color="#3b82f6" />
              <span style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 500 }}>{totalDays} day{totalDays > 1 ? "s" : ""} requested</span>
            </div>
          )}
          <Field label="Reason">
            <Textarea placeholder="Provide a brief reason for your leave request..." value={form.reason} onChange={set("reason")} />
          </Field>
          <Btn variant="primary" loading={loading} onClick={submit} icon="check" style={{ width: "100%", justifyContent: "center" }}>
            Submit Leave Request
          </Btn>
        </div>
      </Card>
    </div>
  );
};

// Profile
const ProfilePage = ({ token, toast }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/employee/profile", {}, token).then(r => setProfile(r.data)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  if (!profile) return <Empty icon="profile" title="Profile not found" />;

  const rows = [
    { label: "Full Name", value: profile.fullName },
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone },
    { label: "Department", value: profile.department },
    { label: "Designation", value: profile.designation },
    { label: "Joining Date", value: profile.joiningDate },
    { label: "Leave Balance", value: <span style={{ color: "#6366f1", fontWeight: 700 }}>{profile.leaveBalance} days</span> },
  ];

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>My Profile</h2>
      <Card>
        <div style={{ padding: "24px 24px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff" }}>
              {profile.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{profile.fullName}</div>
              <div style={{ color: "#64748b", fontSize: 14, marginTop: 2 }}>{profile.designation} · {profile.department}</div>
            </div>
          </div>
          {rows.map(r => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f8fafc" }}>
              <div style={{ width: 140, fontSize: 13, color: "#64748b", fontWeight: 500, flexShrink: 0 }}>{r.label}</div>
              <div style={{ fontSize: 14, color: "#374151" }}>{r.value || "—"}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Employees (Manager)
const EmployeesPage = ({ token, toast }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", department: "", designation: "", joiningDate: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api("/employee", {}, token).then(r => setEmployees(r.data || [])).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      if (showEdit) {
        await api(`/employee/${showEdit.id}`, { method: "PUT", body: JSON.stringify(form) }, token);
        toast.success("Employee updated.");
      } else {
        await api("/employee", { method: "POST", body: JSON.stringify(form) }, token);
        toast.success("Employee added.");
      }
      setShowAdd(false); setShowEdit(null);
      load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this employee?")) return;
    setDeleting(id);
    try {
      await api(`/employee/${id}`, { method: "DELETE" }, token);
      toast.success("Employee deleted.");
      load();
    } catch (e) { toast.error(e.message); } finally { setDeleting(null); }
  };

  const openEdit = (emp) => {
    setForm({ fullName: emp.fullName, email: emp.email, phone: emp.phone || "", department: emp.department, designation: emp.designation, joiningDate: emp.joiningDate || "" });
    setShowEdit(emp);
  };

  const filtered = employees.filter(e => !search || e.fullName?.toLowerCase().includes(search.toLowerCase()) || e.department?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase()));

  const EmpForm = () => (
    <>
      <Field label="Full Name" required><Input value={form.fullName} onChange={set("fullName")} placeholder="Employee name" /></Field>
      <Field label="Email" required><Input type="email" value={form.email} onChange={set("email")} placeholder="email@company.com" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Phone"><Input value={form.phone} onChange={set("phone")} placeholder="+91..." /></Field>
        <Field label="Joining Date"><Input type="date" value={form.joiningDate} onChange={set("joiningDate")} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Department" required><Input value={form.department} onChange={set("department")} placeholder="Engineering" /></Field>
        <Field label="Designation" required><Input value={form.designation} onChange={set("designation")} placeholder="SDE" /></Field>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="secondary" onClick={() => { setShowAdd(false); setShowEdit(null); }}>Cancel</Btn>
        <Btn variant="primary" loading={saving} onClick={save}>{showEdit ? "Save Changes" : "Add Employee"}</Btn>
      </div>
    </>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Employees</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{employees.length} total</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn icon="refresh" variant="secondary" size="sm" onClick={load}>Refresh</Btn>
          <Btn icon="plus" onClick={() => { setForm({ fullName: "", email: "", phone: "", department: "", designation: "", joiningDate: "" }); setShowAdd(true); }}>Add Employee</Btn>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
          <Icon name="search" size={16} color="#94a3b8" />
        </div>
        <Input placeholder="Search by name, email, or department…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
      </div>

      <Card>
        {loading ? <Spinner /> : (
          <Table
            cols={[
              { key: "fullName", label: "Name", render: (v, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{v?.[0]?.toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 500, color: "#111827" }}>{v}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{r.email}</div>
                  </div>
                </div>
              )},
              { key: "department", label: "Department" },
              { key: "designation", label: "Designation" },
              { key: "phone", label: "Phone", render: v => v || "—" },
              { key: "leaveBalance", label: "Balance", render: v => <span style={{ color: "#6366f1", fontWeight: 600 }}>{v}</span> },
              { key: "id", label: "Actions", render: (id, row) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn size="sm" variant="secondary" icon="edit" onClick={() => openEdit(row)}>Edit</Btn>
                  <Btn size="sm" variant="danger" loading={deleting === id} onClick={() => del(id)}><Icon name="trash" size={13} /></Btn>
                </div>
              )},
            ]}
            rows={filtered}
            emptyIcon="users"
            emptyText="No employees found"
          />
        )}
      </Card>

      <Modal open={showAdd || !!showEdit} onClose={() => { setShowAdd(false); setShowEdit(null); }} title={showEdit ? "Edit Employee" : "Add Employee"}>
        <EmpForm />
      </Modal>
    </div>
  );
};

// All Leaves (Manager)
const AllLeaves = ({ token }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    api("/leave/all", {}, token).then(r => setLeaves(r.data || [])).finally(() => setLoading(false));
  }, [token]);

  const filtered = filter === "ALL" ? leaves : leaves.filter(l => l.status === filter);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>All Leave Requests</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{leaves.length} total</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s",
            background: filter === f ? "#6366f1" : "#f8fafc",
            color: filter === f ? "#fff" : "#64748b",
            borderColor: filter === f ? "#6366f1" : "#e2e8f0",
          }}>{f}</button>
        ))}
      </div>
      <Card>
        {loading ? <Spinner /> : (
          <Table
            cols={[
              { key: "employeeName", label: "Employee" },
              { key: "leaveType", label: "Type" },
              { key: "startDate", label: "From" },
              { key: "endDate", label: "To" },
              { key: "totalDays", label: "Days", render: v => v || "—" },
              { key: "reason", label: "Reason", wrap: true, render: v => <span style={{ color: "#64748b", maxWidth: 180, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v || "—"}</span> },
              { key: "status", label: "Status", render: v => <Badge status={v} /> },
              { key: "managerRemarks", label: "Remarks", wrap: true, render: v => <span style={{ color: "#64748b" }}>{v || "—"}</span> },
            ]}
            rows={filtered}
          />
        )}
      </Card>
    </div>
  );
};

// Pending Approvals (Manager)
const PendingApprovals = ({ token, toast }) => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [remarkModal, setRemarkModal] = useState(null);
  const [remark, setRemark] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api("/manager/leaves/pending", {}, token).then(r => setPending(r.data || [])).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, action) => {
    setActing(`${id}-${action}`);
    try {
      await api(`/manager/leaves/${id}/${action}`, { method: "PUT", body: JSON.stringify({ remarks: remark || null }) }, token);
      toast.success(`Leave ${action}d successfully.`);
      setRemarkModal(null); setRemark("");
      load();
    } catch (e) { toast.error(e.message); } finally { setActing(null); }
  };

  const openAction = (leave, action) => { setRemarkModal({ ...leave, action }); setRemark(""); };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Pending Approvals</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{pending.length} request{pending.length !== 1 ? "s" : ""} waiting</p>
        </div>
        <Btn icon="refresh" variant="secondary" size="sm" onClick={load}>Refresh</Btn>
      </div>

      {loading ? <Spinner /> : pending.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <Empty icon="check" title="No pending requests" desc="All leave requests have been reviewed." />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pending.map(l => (
            <div key={l.id} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {l.employeeName?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 15 }}>{l.employeeName}</div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
                  {l.leaveType} · {l.startDate} → {l.endDate} · {l.totalDays ?? "?"} day{l.totalDays !== 1 ? "s" : ""}
                </div>
                {l.reason && <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4, fontStyle: "italic" }}>"{l.reason}"</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="success" icon="check" size="sm" loading={acting === `${l.id}-approve`} onClick={() => openAction(l, "approve")}>Approve</Btn>
                <Btn variant="danger" icon="x" size="sm" loading={acting === `${l.id}-reject`} onClick={() => openAction(l, "reject")}>Reject</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!remarkModal} onClose={() => setRemarkModal(null)} title={`${remarkModal?.action === "approve" ? "Approve" : "Reject"} Leave Request`}>
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>{remarkModal?.employeeName}</div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{remarkModal?.leaveType} · {remarkModal?.startDate} → {remarkModal?.endDate}</div>
        </div>
        <Field label="Remarks (optional)">
          <Textarea placeholder="Add a note for the employee…" value={remark} onChange={e => setRemark(e.target.value)} />
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => setRemarkModal(null)}>Cancel</Btn>
          <Btn variant={remarkModal?.action === "approve" ? "success" : "danger"} loading={!!acting} onClick={() => act(remarkModal.id, remarkModal.action)}>
            {remarkModal?.action === "approve" ? "Approve" : "Reject"}
          </Btn>
        </div>
      </Modal>
    </div>
  );
};

// Team Availability (Manager)
const TeamAvailability = ({ token, toast }) => {
  const [mode, setMode] = useState("today");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dept, setDept] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    try {
      let r;
      if (mode === "today") r = await api("/team/availability/today", {}, token);
      else if (mode === "date") r = await api(`/team/availability/date?date=${date}`, {}, token);
      else r = await api(`/team/availability/department?department=${encodeURIComponent(dept)}&date=${date}`, {}, token);
      setResult(r.data);
    } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { if (mode === "today") fetch_(); }, [mode]);

  const pct = result ? Math.round((result.availableEmployees / (result.totalEmployees || 1)) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Team Availability</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Check who's available on any given day</p>
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[{ id: "today", label: "Today" }, { id: "date", label: "By Date" }, { id: "dept", label: "By Department" }].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            padding: "8px 18px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: mode === m.id ? "#6366f1" : "#f8fafc", color: mode === m.id ? "#fff" : "#64748b", borderColor: mode === m.id ? "#6366f1" : "#e2e8f0"
          }}>{m.label}</button>
        ))}
      </div>

      {mode !== "today" && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-end" }}>
          <Field label="Date" style={{ margin: 0, flex: "0 0 200px" }}>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </Field>
          {mode === "dept" && (
            <Field label="Department" style={{ margin: 0, flex: 1 }}>
              <Input placeholder="e.g. Engineering" value={dept} onChange={e => setDept(e.target.value)} />
            </Field>
          )}
          <Btn onClick={fetch_} loading={loading} icon="search" style={{ marginBottom: 18 }}>Check</Btn>
        </div>
      )}

      {loading && <Spinner />}

      {result && !loading && (
        <div>
          {/* Summary */}
          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Attendance Summary</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{mode === "today" ? "Today" : date}</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, textAlign: "center", padding: "16px 12px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{result.availableEmployees}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Available</div>
              </div>
              <div style={{ flex: 1, textAlign: "center", padding: "16px 12px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#dc2626" }}>{result.employeesOnLeave}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>On Leave</div>
              </div>
              <div style={{ flex: 1, textAlign: "center", padding: "16px 12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#6366f1" }}>{result.totalEmployees}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Total</div>
              </div>
            </div>
            {/* Progress bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                <span>Availability</span><span style={{ fontWeight: 600, color: pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#dc2626" }}>{pct}%</span>
              </div>
              <div style={{ background: "#f1f5f9", borderRadius: 8, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444", borderRadius: 8, transition: "width 0.4s ease" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card title={`Available (${result.availableEmployees})`}>
              <div style={{ padding: "12px 16px", maxHeight: 280, overflowY: "auto" }}>
                {result.availableEmployeeNames?.length === 0 ? (
                  <Empty icon="users" title="No one available" />
                ) : result.availableEmployeeNames?.map(n => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#16a34a" }}>{n[0]}</div>
                    <span style={{ fontSize: 14, color: "#374151" }}>{n}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title={`On Leave (${result.employeesOnLeave})`}>
              <div style={{ padding: "12px 16px", maxHeight: 280, overflowY: "auto" }}>
                {result.employeesOnLeaveNames?.length === 0 ? (
                  <Empty icon="check" title="No one on leave" />
                ) : result.employeesOnLeaveNames?.map(n => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#dc2626" }}>{n[0]}</div>
                    <span style={{ fontSize: 14, color: "#374151" }}>{n}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("lms_token") || null);
  const [role, setRole] = useState(() => localStorage.getItem("lms_role") || null);
  const [active, setActive] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const toast = useToast();

  // Decode role from JWT
  const decodeRole = (t) => {
    try {
      const payload = JSON.parse(atob(t.split(".")[1]));
      return payload.role || payload.roles?.[0]?.replace("ROLE_", "") || null;
    } catch { return null; }
  };

  const onAuth = (t) => {
    const r = decodeRole(t);
    localStorage.setItem("lms_token", t);
    localStorage.setItem("lms_role", r);
    setToken(t); setRole(r);
    toast.success("Welcome back!");
  };

  const logout = () => {
    localStorage.removeItem("lms_token"); localStorage.removeItem("lms_role");
    setToken(null); setRole(null); setProfile(null);
    setActive("dashboard");
  };

  // Load profile
  useEffect(() => {
    if (!token) return;
    api("/employee/profile", {}, token).then(r => setProfile(r.data)).catch(() => {});
  }, [token]);

  if (!token) return <>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }`}</style>
    <AuthPage onAuth={onAuth} toast={toast} />
    <Toast toasts={toast.toasts} remove={toast.remove} />
  </>;

  const pageMap = {
    // Employee pages
    "dashboard": role === "MANAGER" ? <ManagerDashboard token={token} setActive={setActive} /> : <EmployeeDashboard token={token} setActive={setActive} />,
    "my-leaves": <MyLeaves token={token} toast={toast} />,
    "apply-leave": <ApplyLeave token={token} toast={toast} />,
    "profile": <ProfilePage token={token} toast={toast} />,
    // Manager pages
    "employees": <EmployeesPage token={token} toast={toast} />,
    "all-leaves": <AllLeaves token={token} />,
    "pending": <PendingApprovals token={token} toast={toast} />,
    "team-availability": <TeamAvailability token={token} toast={toast} />,
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
      <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh" }}>
        <Sidebar role={role} active={active} setActive={setActive} onLogout={logout} profile={profile} />
        <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", minHeight: "100vh" }}>
          {pageMap[active] || <Empty icon="alert" title="Page not found" />}
        </main>
      </div>
      <Toast toasts={toast.toasts} remove={toast.remove} />
    </>
  );
}
