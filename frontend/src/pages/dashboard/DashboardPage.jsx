import { useEffect, useState } from 'react';
import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiBox,
  FiRefreshCcw,
  FiShieldOff
} from 'react-icons/fi';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import DashboardCard from '../../components/DashboardCard.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import { fetchDashboardStats } from '../../services/dashboardService.js';

const DashboardPage = () => {
  const [summary, setSummary] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expired: 0,
    expiringSoon: 0,
    damagedStockCount: 0,
    totalReturnRequests: 0,
    totalNotifications: 0,
    unreadNotifications: 0
  });

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardStats = async () => {
    setLoading(true);

    try {
      const response = await fetchDashboardStats();

      setSummary({
        totalMedicines: response.data.totalMedicines || 0,
        lowStock: response.data.lowStock || 0,
        expired: response.data.expired || 0,
        expiringSoon: response.data.expiringSoon || 0,
        damagedStockCount: response.data.damagedStockCount || 0,
        totalReturnRequests: response.data.totalReturnRequests || 0,
        totalNotifications: response.data.totalNotifications || 0,
        unreadNotifications: response.data.unreadNotifications || 0
      });

      setChartData(response.data.chartData || []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="MediWave Dashboard"
        subtitle="Operations overview"
      />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Medicines"
          value={summary.totalMedicines}
          accent="bg-emerald-50"
          icon={<FiBox className="h-6 w-6" />}
          description="Track all active inventory items."
        />

        <DashboardCard
          title="Low Stock"
          value={summary.lowStock}
          accent="bg-orange-50"
          icon={<FiAlertTriangle className="h-6 w-6" />}
          description="Medicines that need restocking soon."
        />

        <DashboardCard
          title="Expired"
          value={summary.expired}
          accent="bg-red-50"
          icon={<FiRefreshCcw className="h-6 w-6" />}
          description="Expired inventory requiring removal."
        />

        <DashboardCard
          title="Expiring Soon"
          value={summary.expiringSoon}
          accent="bg-sky-50"
          icon={<FiActivity className="h-6 w-6" />}
          description="Items nearing their expiry window."
        />

        <DashboardCard
          title="Damaged Stock"
          value={summary.damagedStockCount}
          accent="bg-amber-50"
          icon={<FiShieldOff className="h-6 w-6" />}
          description="Damaged stock records logged in the system."
        />

        <DashboardCard
          title="Notification Alerts"
          value={summary.unreadNotifications}
          accent="bg-indigo-50"
          icon={<FiBell className="h-6 w-6" />}
          description="Unread alert items in the system."
        />
      </div>

      <section className="glass-card rounded-[36px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              Inventory Trend
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              Stock & Return Insights
            </h3>
          </div>

          <button
            onClick={loadDashboardStats}
            className="inline-flex items-center gap-2 rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <FiActivity className="h-4 w-4" />
            Refresh Metrics
          </button>
        </div>

        <div className="mt-6 h-96">
          {loading ? (
            <div className="flex h-full items-center justify-center text-slate-500">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.3)"
                />

                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="stock"
                  stroke="#3b82f6"
                  fill="#bfdbfe"
                  fillOpacity={0.7}
                />

                <Area
                  type="monotone"
                  dataKey="returns"
                  stroke="#10b981"
                  fill="#d1fae5"
                  fillOpacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;