function StatusBadge({ status }) {

  let colorClass = '';
  let label = status;

  if (status === 'ACTIVE') {
    colorClass = 'bg-success';       // Green = auction is live
  } else if (status === 'CLOSED') {
    colorClass = 'bg-secondary';     // Gray = auction ended normally
  } else if (status === 'FORCE_CLOSED') {
    colorClass = 'bg-danger';        // Red = auction hit forced deadline
    label = 'FORCE CLOSED';
  }

  return (
    <span className={`badge ${colorClass}`}>
      {label}
    </span>
  );
}

export default StatusBadge;