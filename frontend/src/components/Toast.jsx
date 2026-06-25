import { useEffect } from 'react';
import { useToast } from '../context/ToastContext.jsx';

const Toast = () => {
  const { toast } = useToast();

  useEffect(() => {
    if (!toast) return;
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed right-5 top-5 z-50 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
      <p className="text-sm font-semibold text-slate-900">{toast.type.toUpperCase()}</p>
      <p className="mt-2 text-sm text-slate-600">{toast.message}</p>
    </div>
  );
};

export default Toast;
