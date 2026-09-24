import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm transition-all duration-300 transform translate-y-0 opacity-100',
              item.type === 'success' && 'bg-emerald-900/90 text-emerald-100 border-emerald-700/60 backdrop-blur',
              item.type === 'error' && 'bg-red-900/90 text-red-100 border-red-700/60 backdrop-blur',
              item.type === 'info' && 'bg-neutral-900/95 text-neutral-100 border-neutral-800 backdrop-blur'
            )}
            role="alert"
          >
            {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {item.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {item.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="flex-1 font-medium">{item.message}</span>
            <button
              onClick={() => removeToast(item.id)}
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
