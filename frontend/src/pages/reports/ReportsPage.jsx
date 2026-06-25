import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import SectionHeader from '../../components/SectionHeader.jsx';
import { downloadMedicineCsv, downloadMedicineExcel, fetchReportSummary } from '../../services/reportService.js';
import { useToast } from '../../context/ToastContext.jsx';

const rangeOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'All Time', value: 'all' }
];

const statusColors = {
  Pending: '#6366f1',
  Approved: '#10b981',
  Rejected: '#ef4444',
  Completed: '#0ea5e9'
};

const ReportsPage = () => {
  const { showToast } = useToast();
  const [selectedRange, setSelectedRange] = useState('30d');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReportSummary = async (range) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchReportSummary(range);
      setReportData(response.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load report analytics.');
      showToast('Could not load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportSummary(selectedRange);
  }, [selectedRange]);

  const inventoryCards = useMemo(() => {
    if (!reportData) return [];
    const { inventorySummary } = reportData;
    return [
      { label: 'Total Medicines', value: inventorySummary.totalMedicines },
      { label: 'Low Stock', value: inventorySummary.lowStock },
      { label: 'Expired Medicines', value: inventorySummary.expiredMedicines },
      { label: 'Expiring Soon', value: inventorySummary.expiringSoon },
      { label: 'Inventory Value', value: inventorySummary.totalInventoryValue, format: true }
    ];
  }, [reportData]);

  const returnStatusData = reportData?.chartData?.returnStatus || [];
  const damageReasonData = reportData?.chartData?.damageReasons || [];
  const inventoryTrendData = reportData?.chartData?.inventoryTrend || [];

  const downloadFile = async (promise, filename) => {
    try {
      const response = await promise();
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      showToast(`${filename} downloaded`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Download failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Reports & Analytics" subtitle="Visualize inventory, damage and return trends" />

      <div className="glass-card rounded-[32px] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Date range</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{rangeOptions.find((option) => option.value === selectedRange)?.label}</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedRange(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedRange === option.value ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="glass-card rounded-[32px] p-8 text-center text-slate-500">Loading report analytics…</div>
      )}

      {error && (
        <div className="glass-card rounded-[32px] p-6 border border-red-200 bg-red-50 text-red-800">{error}</div>
      )}

      {!loading && reportData && (
        <>
          <section className="grid gap-6 lg:grid-cols-5">
            {inventoryCards.map((card) => (
              <div key={card.label} className="glass-card rounded-[28px] p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {card.format
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(card.value)
                    : card.value}
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <div className="glass-card rounded-[32px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Low Stock Medicines</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">At Risk Items ({reportData.alertSummary?.lowStockCount || 0})</h3>
              <div className="mt-6 space-y-3 max-h-72 overflow-y-auto">
                {reportData.alertSummary?.lowStockMedicines?.length > 0 ? (
                  reportData.alertSummary.lowStockMedicines.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-[16px] border border-orange-200 bg-orange-50 p-3">
                      <div>
                        <p className="font-semibold text-slate-900">{med.name}</p>
                        <p className="text-xs text-slate-500">Quantity: {med.quantity}</p>
                      </div>
                      <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">LOW STOCK</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-8">No low stock medicines</p>
                )}
              </div>
            </div>

            <div className="glass-card rounded-[32px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Expiring Soon</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Within 30 Days ({reportData.alertSummary?.expiringCount || 0})</h3>
              <div className="mt-6 space-y-3 max-h-72 overflow-y-auto">
                {reportData.alertSummary?.expiringMedicines?.length > 0 ? (
                  reportData.alertSummary.expiringMedicines.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-[16px] border border-yellow-200 bg-yellow-50 p-3">
                      <div>
                        <p className="font-semibold text-slate-900">{med.name}</p>
                        <p className="text-xs text-slate-500">{new Date(med.expiryDate).toLocaleDateString()}</p>
                      </div>
                      <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white">EXPIRING</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-8">No expiring medicines</p>
                )}
              </div>
            </div>

            <div className="glass-card rounded-[32px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Expired Medicines</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Action Required ({reportData.alertSummary?.expiredCount || 0})</h3>
              <div className="mt-6 space-y-3 max-h-72 overflow-y-auto">
                {reportData.alertSummary?.expiredMedicines?.length > 0 ? (
                  reportData.alertSummary.expiredMedicines.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-[16px] border border-red-200 bg-red-50 p-3">
                      <div>
                        <p className="font-semibold text-slate-900">{med.name}</p>
                        <p className="text-xs text-slate-500">Expired: {new Date(med.expiryDate).toLocaleDateString()}</p>
                      </div>
                      <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">EXPIRED</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-8">No expired medicines</p>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card rounded-[32px] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Damaged stock summary</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">Damage insights</h3>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-white/70 p-5">
                  <p className="text-sm text-slate-500">Total damaged quantity</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{reportData.damagedStockSummary.totalDamagedStock}</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white/70 p-5">
                  <p className="text-sm text-slate-500">Most damaged medicine</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">
                    {reportData.damagedStockSummary.mostDamagedMedicine?.name || 'No data'}
                  </p>
                  {reportData.damagedStockSummary.mostDamagedMedicine && (
                    <p className="mt-2 text-sm text-slate-500">{reportData.damagedStockSummary.mostDamagedMedicine.quantity} units damaged</p>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[32px] p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Return request summary</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Request workflow</h3>
              </div>
              <div className="mt-6 grid gap-4 grid-cols-2">
                {[
                  { label: 'Total requests', value: reportData.returnRequestSummary.totalRequests },
                  { label: 'Pending', value: reportData.returnRequestSummary.pending },
                  { label: 'Approved', value: reportData.returnRequestSummary.approved },
                  { label: 'Rejected', value: reportData.returnRequestSummary.rejected },
                  { label: 'Completed', value: reportData.returnRequestSummary.completed }
                ].map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white/70 p-4">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <div className="glass-card rounded-[32px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Return status</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Status distribution</h3>
              <div className="mt-6 h-72">
                {returnStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={returnStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={84} paddingAngle={4}>
                        {returnStatusData.map((entry) => (
                          <Cell key={entry.name} fill={statusColors[entry.name] || '#818cf8'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Requests']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">No return request data</div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-[32px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Damaged reasons</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Reason breakdown</h3>
              <div className="mt-6 h-72">
                {damageReasonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={damageReasonData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="reason" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Damaged units']} />
                      <Bar dataKey="value" fill="#f97316" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">No damage reason data</div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-[32px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Inventory value</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Trend over time</h3>
              <div className="mt-6 h-72">
                {inventoryTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={inventoryTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Inventory value']} />
                      <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">No inventory trend data</div>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="glass-card rounded-[32px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Export CSV</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Medicine inventory export</h3>
              <p className="mt-4 text-slate-600">Download current inventory data for reporting or analysis.</p>
              <button onClick={() => downloadFile(downloadMedicineCsv, 'medicines.csv')} className="mt-6 rounded-3xl bg-indigo-600 px-6 py-4 text-white transition hover:bg-indigo-500">
                Download CSV
              </button>
            </div>
            <div className="glass-card rounded-[32px] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Export Excel</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Download XLSX report</h3>
              <p className="mt-4 text-slate-600">Generate a spreadsheet for inventory auditing and tracking.</p>
              <button onClick={() => downloadFile(downloadMedicineExcel, 'medicines.xlsx')} className="mt-6 rounded-3xl bg-emerald-600 px-6 py-4 text-white transition hover:bg-emerald-500">
                Download Excel
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
