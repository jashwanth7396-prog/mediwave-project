import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlusCircle, FiSearch } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader.jsx';
import Table from '../../components/Table.jsx';
import MedicineFormModal from '../../components/MedicineFormModal.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { createMedicine, deleteMedicine, fetchMedicines, updateMedicine } from '../../services/medicineService.js';
import { useToast } from '../../context/ToastContext.jsx';

const statusOptions = ['Active', 'Expiring Soon', 'Critical Expiry', 'Expired'];

const MedicinePage = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { register, handleSubmit, reset, setValue } = useForm();
  const { showToast } = useToast();

  const categories = useMemo(() => {
    const unique = new Set(medicines.map((item) => item.category).filter(Boolean));
    return Array.from(unique).sort();
  }, [medicines]);

  const loadMedicines = async (params = {}) => {
    try {
      const { data } = await fetchMedicines(params);
      setMedicines(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    let filtered = medicines;
    if (search) {
      filtered = filtered.filter((med) =>
        [med.medicineName, med.batchNumber, med.manufacturer, med.category, med.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((med) => med.status === statusFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter((med) => med.category === categoryFilter);
    }
    setFilteredMedicines(filtered);
  }, [medicines, search, statusFilter, categoryFilter]);

  const openCreateModal = () => {
    setSelectedMedicine(null);
    reset({ quantity: 0, price: 0, category: '' });
    setModalOpen(true);
  };

  const onSubmit = async (payload) => {
    try {
      if (selectedMedicine) {
        await updateMedicine(selectedMedicine._id, payload);
        showToast('Medicine updated successfully', 'success');
      } else {
        await createMedicine(payload);
        showToast('Medicine created successfully', 'success');
      }
      setModalOpen(false);
      setSelectedMedicine(null);
      reset();
      loadMedicines({ search, status: statusFilter, category: categoryFilter });
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Unable to save medicine', 'error');
    }
  };

  const onEdit = (item) => {
    setSelectedMedicine(item);
    setModalOpen(true);
    setValue('medicineName', item.medicineName);
    setValue('batchNumber', item.batchNumber);
    setValue('manufacturer', item.manufacturer);
    setValue('category', item.category);
    setValue('quantity', item.quantity);
    setValue('price', item.price);
    setValue('expiryDate', item.expiryDate?.split('T')[0]);
    setValue('description', item.description || '');
  };

  const onDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMedicine(deleteId);
      showToast('Medicine deleted', 'success');
      setConfirmOpen(false);
      setDeleteId(null);
      loadMedicines({ search, status: statusFilter, category: categoryFilter });
    } catch (error) {
      console.error(error);
      showToast('Unable to delete medicine', 'error');
    }
  };

  const statusClasses = {
    Expired: 'bg-red-100 text-red-700 border border-red-200',
    'Critical Expiry': 'bg-orange-100 text-orange-700 border border-orange-200',
    'Expiring Soon': 'bg-yellow-100 text-amber-800 border border-amber-200',
    Active: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
  };

  const columns = [
    { header: 'Medicine', accessor: 'medicineName' },
    { header: 'Batch', accessor: 'batchNumber' },
    { header: 'Manufacturer', accessor: 'manufacturer' },
    { header: 'Category', accessor: 'category' },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Price', accessor: 'price', cell: (row) => `$${row.price.toFixed(2)}` },
    { header: 'Expiry', accessor: 'expiryDate', cell: (row) => new Date(row.expiryDate).toLocaleDateString() },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[row.status] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
          {row.status}
        </span>
      )
    },
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
      <SectionHeader title="Medicines" subtitle="Inventory management" />

      <div className="glass-card rounded-[32px] p-6">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Inventory catalog</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Manage medicines</h3>
          </div>
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-5 py-3 text-white transition hover:bg-emerald-500">
            <FiPlusCircle className="h-4 w-4" /> Add Medicine
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_280px] xl:items-end">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadMedicines({ search: e.target.value, status: statusFilter, category: categoryFilter })}
              placeholder="Search medicines, category, manufacturer"
              className="w-full rounded-3xl border border-slate-300 bg-white px-12 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
              <option value="">All statuses</option>
              {statusOptions.map((status) => (<option key={status} value={status}>{status}</option>))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
              <option value="">All categories</option>
              {categories.map((category) => (<option key={category} value={category}>{category}</option>))}
            </select>
          </div>
        </div>

        <Table columns={columns} data={filteredMedicines} />
      </div>

      <MedicineFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedMedicine(null); reset(); }}
        onSubmit={onSubmit}
        defaultValues={selectedMedicine}
        register={register}
        handleSubmit={handleSubmit}
        categories={categories.length ? categories : ['General', 'OTC', 'Prescription', 'Supplements']}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Delete medicine"
        message="Are you sure you want to delete this medicine record?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default MedicinePage;
