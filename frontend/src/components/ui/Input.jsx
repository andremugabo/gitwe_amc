import React from 'react';

const Input = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  name,
  required = false,
  placeholder,
  value,
  onChange,
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`block w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 bg-slate-50 border ${
            error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-blue-600/20 focus:border-blue-600'
          } rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[11px] text-red-500 font-medium animate-in fade-in duration-200">{error}</p>
      )}
    </div>
  );
};

export default Input;
