import React from 'react';

const StatusBadge = ({
  status,
  className = ''
}) => {
  const normalized = (status || '').toUpperCase();

  const styles = {
    UNION_ADMIN: 'bg-blue-50 text-blue-800 border-blue-100',
    FIELD_SECRETARY: 'bg-amber-50 text-amber-800 border-amber-100',
    PASTOR: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    ELDER: 'bg-indigo-50 text-indigo-800 border-indigo-100',
    
    // Statuses
    ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    ENROLLED: 'bg-blue-50 text-blue-800 border-blue-100',
    COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    FAILED: 'bg-red-50 text-red-800 border-red-100',
    SENT: 'bg-slate-50 text-slate-800 border-slate-100'
  };

  const currentStyle = styles[normalized] || 'bg-slate-50 text-slate-700 border-slate-100';

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${currentStyle} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
