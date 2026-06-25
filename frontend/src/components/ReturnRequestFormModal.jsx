import { useEffect } from 'react';

const ReturnRequestFormModal = ({ open, onClose, onSubmit, handleSubmit, register, defaultValues, medicines, reasons, statuses, existingImageUrls = [], newImagePreviews = [], onImageChange }) => {
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
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Return request</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{defaultValues ? 'Edit Return Request' : 'New Return Request'}</h3>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-200 px-4 py-3 text-slate-900 transition hover:bg-slate-300">Close</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Medicine</span>
              <select defaultValue={defaultValues?.medicineId || ''} {...register('medicineId', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none">
                <option value="">Select medicine</option>
                {medicines.map((m) => (<option key={m._id} value={m._id}>{m.medicineName}</option>))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Return Quantity</span>
              <input type="number" defaultValue={defaultValues?.returnQuantity ?? 1} min="1" {...register('returnQuantity', { required: true, min: 1 })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Reason</span>
              <select defaultValue={defaultValues?.reason || reasons[0]} {...register('reason', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none">
                {reasons.map((r) => (<option key={r} value={r}>{r}</option>))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Supplier</span>
              <input type="text" defaultValue={defaultValues?.supplierName || ''} {...register('supplierName')} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Request Date</span>
              <input type="date" defaultValue={defaultValues?.requestDate?.split('T')[0] || new Date().toISOString().split('T')[0]} {...register('requestDate', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Status</span>
              <select defaultValue={defaultValues?.status || statuses[0]} {...register('status', { required: true })} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none">
                {statuses.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Remarks</span>
            <input type="text" defaultValue={defaultValues?.remarks || ''} {...register('remarks')} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Attach photos</span>
            <input type="file" multiple accept="image/*" onChange={onImageChange} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none" />
          </label>

          {(existingImageUrls.length || newImagePreviews.length) && (
            <div className="grid gap-3 sm:grid-cols-3">
              {existingImageUrls.map((url, index) => (
                <img key={`existing-${index}`} src={url} alt={`existing return photo ${index + 1}`} className="h-24 w-full rounded-2xl object-cover border border-slate-200" />
              ))}
              {newImagePreviews.map((url, index) => (
                <img key={`preview-${index}`} src={url} alt={`selected return photo ${index + 1}`} className="h-24 w-full rounded-2xl object-cover border border-blue-200" />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-3xl border border-slate-300 px-6 py-3 text-slate-700 transition hover:bg-slate-100">Cancel</button>
            <button type="submit" className="rounded-3xl bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-500">{defaultValues ? 'Update Request' : 'Create Request'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnRequestFormModal;
