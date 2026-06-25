const ConfirmModal = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="glass-card w-full max-w-lg rounded-[32px] p-6 shadow-2xl max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <h3 className="text-2xl font-semibold text-slate-900">{message}</h3>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <button onClick={onCancel} className="rounded-3xl border border-slate-300 px-6 py-3 text-slate-700 transition hover:bg-slate-100">Cancel</button>
            <button onClick={onConfirm} className="rounded-3xl bg-red-500 px-6 py-3 text-white transition hover:bg-red-600">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
