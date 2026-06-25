import { useEffect } from 'react';

const MedicineFormModal = ({ open, onClose, onSubmit, defaultValues, register, handleSubmit, categories }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="glass-card w-full max-w-3xl rounded-[32px] p-6 shadow-2xl max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Medicine details</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{defaultValues ? 'Edit Medicine' : 'Add Medicine'}</h3>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-200 px-4 py-3 text-slate-900 transition hover:bg-slate-300">Close</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Medicine Name</span>
              <input type="text" defaultValue={defaultValues?.medicineName || ''} {...register('medicineName', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Batch Number</span>
              <input type="text" defaultValue={defaultValues?.batchNumber || ''} {...register('batchNumber', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </label>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Manufacturer</span>
              <input type="text" defaultValue={defaultValues?.manufacturer || ''} {...register('manufacturer', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Category</span>
              <select defaultValue={defaultValues?.category || ''} {...register('category', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none">
                <option value="">Select category</option>
                {categories.map((category) => (<option key={category} value={category}>{category}</option>))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Quantity</span>
              <input type="number" defaultValue={defaultValues?.quantity ?? 0} {...register('quantity', { required: true, min: 0 })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Price</span>
              <input type="number" step="0.01" defaultValue={defaultValues?.price ?? 0} {...register('price', { required: true, min: 0 })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </label>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Expiry Date</span>
              <input type="date" defaultValue={defaultValues?.expiryDate?.split('T')[0] || ''} {...register('expiryDate', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Description</span>
              <input type="text" defaultValue={defaultValues?.description || ''} {...register('description')} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </label>
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-3xl border border-slate-300 px-6 py-3 text-slate-700 transition hover:bg-slate-100">Cancel</button>
            <button type="submit" className="rounded-3xl bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-500">{defaultValues ? 'Update Medicine' : 'Add Medicine'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineFormModal;
