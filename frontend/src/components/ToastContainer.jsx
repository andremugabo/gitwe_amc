import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((type, message) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, type, message }]);

      // Auto-remove after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    });

    return () => unsubscribe();
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map(t => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isInfo = t.type === 'info';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 animate-in slide-in-from-right-4 fade-in ${
              isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              isError ? 'bg-red-50 border-red-200 text-red-900' :
              'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 size={18} className="text-emerald-600" />}
              {isError && <XCircle size={18} className="text-red-600" />}
              {isInfo && <Info size={18} className="text-blue-600" />}
            </div>
            
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {t.message}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className={`shrink-0 p-0.5 rounded-lg transition-all ${
                isSuccess ? 'hover:bg-emerald-150 text-emerald-500 hover:text-emerald-700' :
                isError ? 'hover:bg-red-150 text-red-500 hover:text-red-700' :
                'hover:bg-blue-150 text-blue-500 hover:text-blue-700'
              }`}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
