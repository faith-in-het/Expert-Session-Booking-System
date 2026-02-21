const STATUS_CLASS = {
  Pending: 'status pending',
  Confirmed: 'status confirmed',
  Completed: 'status completed',
}

function StatusPill({ status }) {
  return <span className={STATUS_CLASS[status] || 'status'}>{status}</span>
}

export default StatusPill
