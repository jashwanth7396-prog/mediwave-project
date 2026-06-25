import { useEffect } from 'react';

const DamagedStockFormModal = ({ open, onClose, onSubmit, handleSubmit, register, defaultValues, medicines, reasons, statuses }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="glass-card w-full max-w-3xl rounded-[32px] p-6 shadow-2xl max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Damaged stock details</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{defaultValues ? 'Edit Damaged Stock' : 'Log Damaged Stock'}</h3>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-200 px-4 py-3 text-slate-900 transition hover:bg-slate-300">Close</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Medicine</span>
              <select defaultValue={defaultValues?.medicineId || ''} {...register('medicineId', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                <option value="">Select medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine._id} value={medicine._id}>{medicine.medicineName}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Damaged Quantity</span>
              <input type="number" defaultValue={defaultValues?.damagedQuantity ?? 1} min="1" {...register('damagedQuantity', { required: true, min: 1 })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Reason</span>
              <select defaultValue={defaultValues?.reason || reasons[0]} {...register('reason', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Status</span>
              <select defaultValue={defaultValues?.status || statuses[0]} {...register('status', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Reported By</span>
              <input type="text" defaultValue={defaultValues?.reportedBy || ''} {...register('reportedBy', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Reported Date</span>
              <input type="date" defaultValue={defaultValues?.reportedDate?.split('T')[0] || new Date().toISOString().split('T')[0]} {...register('reportedDate', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-3xl border border-slate-300 px-6 py-3 text-slate-700 transition hover:bg-slate-100">Cancel</button>
            <button type="submit" className="rounded-3xl bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-500">{defaultValues ? 'Update Damage' : 'Log Damage'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DamagedStockFormModal;
