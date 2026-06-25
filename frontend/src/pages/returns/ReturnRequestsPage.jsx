import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlusCircle, FiSearch } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader.jsx';
import Table from '../../components/Table.jsx';
import ReturnRequestFormModal from '../../components/ReturnRequestFormModal.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { createReturnRequest, deleteReturnRequest, fetchReturnRequests, updateReturnRequest } from '../../services/returnService.js';
import { fetchMedicines } from '../../services/medicineService.js';
import { useToast } from '../../context/ToastContext.jsx';

const reasonOptions = ['Expired', 'Damaged', 'Wrong Supply', 'Manufacturing Defect', 'Excess Stock', 'Product Recall', 'Other'];
const statusOptions = ['Pending', 'Approved', 'Rejected', 'Completed'];

const ReturnRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const { register, handleSubmit, reset, setValue } = useForm();
  const { showToast } = useToast();

  const loadRequests = async (params = {}) => {
    try {
      const { data } = await fetchReturnRequests(params);
      setRequests(data);
    } catch (error) {
      console.error(error);
      showToast('Unable to load return requests', 'error');
    }
  };

  const loadMedicines = async () => {
    try {
      const { data } = await fetchMedicines();
      setMedicines(data);
    } catch (error) {
      console.error(error);
      showToast('Unable to load medicines', 'error');
    }
  };

  useEffect(() => {
    loadRequests();
    loadMedicines();
  }, []);

  useEffect(() => {
    let filtered = requests;
    if (search) {
      filtered = filtered.filter((r) => [r.medicineName, r.batchNumber, r.reason, r.supplierName, r.remarks, r.status].filter(Boolean).some((v) => v.toLowerCase().includes(search.toLowerCase())));
    }
    if (statusFilter) filtered = filtered.filter((r) => r.status === statusFilter);
    setFilteredRequests(filtered);
  }, [requests, search, statusFilter]);

  const revokePreviews = () => {
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImagePreviews([]);
  };

  const openCreateModal = () => {
    setSelectedRequest(null);
    setExistingImageUrls([]);
    setNewImageFiles([]);
    revokePreviews();
    reset({ returnQuantity: 1, reason: reasonOptions[0], status: 'Pending', supplierName: '' });
    setModalOpen(true);
  };

  const onSubmit = async (payload) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      newImageFiles.forEach((file) => formData.append('images', file));

      if (selectedRequest) {
        await updateReturnRequest(selectedRequest._id, formData);
        showToast('Return request updated', 'success');
      } else {
        await createReturnRequest(formData);
        showToast('Return request created', 'success');
      }
      setModalOpen(false);
      setSelectedRequest(null);
      setExistingImageUrls([]);
      setNewImageFiles([]);
      revokePreviews();
      reset();
      loadRequests({ search, status: statusFilter });
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Unable to save return request', 'error');
    }
  };

  const onEdit = (item) => {
    setSelectedRequest(item);
    setExistingImageUrls(item.images || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setModalOpen(true);
    setValue('medicineId', item.medicineId);
    setValue('returnQuantity', item.returnQuantity);
    setValue('reason', item.reason);
    setValue('supplierName', item.supplierName || '');
    setValue('requestDate', item.requestDate ? item.requestDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setValue('status', item.status);
    setValue('remarks', item.remarks || '');
  };

  const onDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleImageChange = (event) => {
    revokePreviews();
    const files = Array.from(event.target.files || []);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImageFiles(files);
    setNewImagePreviews(previews);
  };

  const confirmDelete = async () => {
    try {
      await deleteReturnRequest(deleteId);
      showToast('Return request removed', 'success');
      setConfirmOpen(false);
      setDeleteId(null);
      loadRequests({ search, status: statusFilter });
    } catch (error) {
      console.error(error);
      showToast('Unable to delete return request', 'error');
    }
  };

  const columns = [
    { header: 'Medicine', accessor: 'medicineName' },
    { header: 'Batch No.', accessor: 'batchNumber' },
    { header: 'Return Qty', accessor: 'returnQuantity' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Supplier', accessor: 'supplierName' },
    { header: 'Photos', accessor: 'images', cell: (row) => row.images?.length ? `${row.images.length} photo${row.images.length > 1 ? 's' : ''}` : 'None' },
    { header: 'Request Date', accessor: 'requestDate', cell: (row) => new Date(row.requestDate).toLocaleDateString() },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => onEdit(row)} className="rounded-2xl bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800">Edit</button>
          <button onClick={() => onDelete(row._id)} className="rounded-2xl bg-red-500 px-3 py-2 text-white transition hover:bg-red-600">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader title="Return Requests" subtitle="Customer and supplier returns" />
      <div className="glass-card rounded-[32px] p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Returns log</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Manage all requests</h3>
          </div>
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-5 py-3 text-white transition hover:bg-emerald-500">
            <FiPlusCircle className="h-4 w-4" /> New return
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr]">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadRequests({ search: e.target.value, status: statusFilter })} placeholder="Search requests, medicine, reason or supplier" className="w-full rounded-3xl border border-slate-300 bg-white px-12 py-3 text-slate-900 outline-none" />
          </div>
          <label className="block text-sm font-medium text-slate-700">
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none">
              <option value="">All statuses</option>
              {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </label>
        </div>

        <Table columns={columns} data={filteredRequests} />
      </div>

      <ReturnRequestFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRequest(null);
          setExistingImageUrls([]);
          setNewImageFiles([]);
          revokePreviews();
          reset();
        }}
        onSubmit={onSubmit}
        handleSubmit={handleSubmit}
        register={register}
        defaultValues={selectedRequest}
        medicines={medicines}
        reasons={reasonOptions}
        statuses={statusOptions}
        existingImageUrls={existingImageUrls}
        newImagePreviews={newImagePreviews}
        onImageChange={handleImageChange}
      />

      <ConfirmModal open={confirmOpen} title="Delete return request" message="Are you sure you want to delete this return request? If it was approved, inventory will be restored." onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
};

export default ReturnRequestsPage;
