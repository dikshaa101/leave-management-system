import React from 'react'

const map = {
  PENDING:   { cls: 'badge-pending',   label: 'Pending' },
  APPROVED:  { cls: 'badge-approved',  label: 'Approved' },
  REJECTED:  { cls: 'badge-rejected',  label: 'Rejected' },
  CANCELLED: { cls: 'badge-cancelled', label: 'Cancelled' },
}

export default function StatusBadge({ status }) {
  const { cls, label } = map[status] || { cls: 'badge-cancelled', label: status }
  return <span className={cls}>{label}</span>
}
