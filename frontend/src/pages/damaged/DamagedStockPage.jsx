import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlusCircle, FiSearch } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader.jsx';
import Table from '../../components/Table.jsx';
import DamagedStockFormModal from '../../components/DamagedStockFormModal.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { createDamagedItem, deleteDamagedItem, fetchDamagedItems, updateDamagedItem } from '../../services/damagedService.js';
import { fetchMedicines } from '../../services/medicineService.js';
import { useToast } from '../../context/ToastContext.jsx';

const reasonOptions = ['Packaging Damage', 'Expired', 'Leakage', 'Broken Bottle', 'Manufacturing Defect', 'Other'];
const statusOptions = ['Pending', 'Approved', 'Rejected'];

const DamagedStockPage = () => {
  const [damagedItems, setDamagedItems] = useState([]);
  const [filteredDamagedItems, setFilteredDamagedItems] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { register, handleSubmit, reset, setValue } = useForm();
  const { showToast } = useToast();

  const loadDamagedItems = async (params = {}) => {
    try {
      const { data } = await fetchDamagedItems(params);
      setDamagedItems(data);
    } catch (error) {
      console.error(error);
      showToast('Unable to load damaged stock records', 'error');
    }
  };

  const loadMedicines = async () => {
    try {
      const { data } = await fetchMedicines();
      setMedicines(data);
    } catch (error) {
      console.error(error);
      showToast('Unable to load medicine list', 'error');
    }
  };

  useEffect(() => {
    loadDamagedItems();
    loadMedicines();
  }, []);

  useEffect(() => {
    let filtered = damagedItems;
    if (search) {
      filtered = filtered.filter((item) =>
        [item.medicineName, item.batchNumber, item.reason, item.reportedBy, item.status]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    setFilteredDamagedItems(filtered);
  }, [damagedItems, search, statusFilter]);

  const openCreateModal = () => {
    setSelectedItem(null);
    reset({
      medicineId: '',
      damagedQuantity: 1,
      reason: 'Packaging Damage',
      reportedBy: '',
      reportedDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
    setModalOpen(true);
  };

  const onSubmit = async (payload) => {
    try {
      if (selectedItem) {
        await updateDamagedItem(selectedItem._id, payload);
        showToast('Damaged stock updated', 'success');
      } else {
        await createDamagedItem(payload);
        showToast('Damaged stock logged', 'success');
      }
      setModalOpen(false);
      setSelectedItem(null);
      reset();
      loadDamagedItems({ search, status: statusFilter });
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Unable to save damaged stock', 'error');
    }
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
    setValue('medicineId', item.medicineId);
    setValue('damagedQuantity', item.damagedQuantity);
    setValue('reason', item.reason);
    setValue('reportedBy', item.reportedBy);
    setValue('reportedDate', item.reportedDate ? item.reportedDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setValue('status', item.status);
  };

  const onDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDamagedItem(deleteId);
      showToast('Damaged stock record removed', 'success');
      setConfirmOpen(false);
      setDeleteId(null);
      loadDamagedItems({ search, status: statusFilter });
    } catch (error) {
      console.error(error);
      showToast('Unable to delete damaged stock', 'error');
    }
  };

  const columns = [
    { header: 'Medicine', accessor: 'medicineName' },
    { header: 'Batch No.', accessor: 'batchNumber' },
    { header: 'Damaged Qty', accessor: 'damagedQuantity' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Reported By', accessor: 'reportedBy' },
    { header: 'Reported Date', accessor: 'reportedDate', cell: (row) => new Date(row.reportedDate).toLocaleDateString() },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onEdit(row)} className="rounded-2xl bg-indigo-600 px-3 py-2 text-white transition hover:bg-indigo-500">Edit</button>
          <button onClick={() => onDelete(row._id)} className="rounded-2xl bg-red-500 px-3 py-2 text-white transition hover:bg-red-600">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader title="Damaged Stock" subtitle="Quality and damage tracking" />

      <div className="glass-card rounded-[32px] p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Damage claims</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Review damaged stock</h3>
          </div>
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-5 py-3 text-white transition hover:bg-emerald-500">
            <FiPlusCircle className="h-4 w-4" /> Log damaged stock
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr]">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadDamagedItems({ search: e.target.value, status: statusFilter })}
              placeholder="Search damaged stock, medicine, reason or reporter"
              className="w-full rounded-3xl border border-slate-300 bg-white px-12 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <label className="block text-sm font-medium text-slate-700">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        <Table columns={columns} data={filteredDamagedItems} />
      </div>

      <DamagedStockFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedItem(null); reset(); }}
        onSubmit={onSubmit}
        register={register}
        handleSubmit={handleSubmit}
        defaultValues={selectedItem}
        medicines={medicines}
        reasons={reasonOptions}
        statuses={statusOptions}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Delete damaged stock"
        message="Are you sure you want to delete this damaged stock record? This will restore inventory quantity."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default DamagedStockPage;
