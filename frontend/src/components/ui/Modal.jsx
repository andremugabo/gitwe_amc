import React from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className={`bg-white rounded-2xl ${maxWidth} w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
