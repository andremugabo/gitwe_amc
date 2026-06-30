import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'church-gradient text-white hover:shadow-lg focus:ring-blue-600/50',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 focus:ring-slate-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg focus:ring-red-600/50',
    outline: 'bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 focus:ring-slate-300'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin mr-2" size={16} />
      ) : Icon ? (
        <Icon className="mr-1.5" size={16} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
