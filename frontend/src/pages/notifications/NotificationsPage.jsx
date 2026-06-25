import { useEffect, useMemo, useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from '../../services/notificationService.js';
import { useToast } from '../../context/ToastContext.jsx';

const notificationLabels = {
  LOW_STOCK: 'Low Stock',
  EXPIRY_WARNING: 'Expiry Warning',
  EXPIRED_MEDICINE: 'Expired Medicine',
  DAMAGED_STOCK: 'Damaged Stock',
  RETURN_CREATED: 'Return Created',
  RETURN_APPROVED: 'Return Approved',
  RETURN_REJECTED: 'Return Rejected'
};

const notificationBadgeColors = {
  LOW_STOCK: 'bg-orange-100 text-orange-700',
  EXPIRY_WARNING: 'bg-yellow-100 text-yellow-700',
  EXPIRED_MEDICINE: 'bg-red-100 text-red-700',
  DAMAGED_STOCK: 'bg-amber-100 text-amber-700',
  RETURN_CREATED: 'bg-blue-100 text-blue-700',
  RETURN_APPROVED: 'bg-emerald-100 text-emerald-700',
  RETURN_REJECTED: 'bg-red-100 text-red-700'
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadNotifications = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await fetchNotifications(params);
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      showToast('Notification marked as read', 'success');
      loadNotifications({ type: typeFilter, q: search });
    } catch (error) {
      console.error(error);
      showToast('Update failed', 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      showToast('All notifications marked as read', 'success');
      loadNotifications({ type: typeFilter, q: search });
    } catch (error) {
      console.error(error);
      showToast('Update failed', 'error');
    }
  };

  const removeNotification = async (id) => {
    try {
      await deleteNotification(id);
      showToast('Notification deleted', 'success');
      loadNotifications({ type: typeFilter, q: search });
    } catch (error) {
      console.error(error);
      showToast('Delete failed', 'error');
    }
  };

  const filteredNotifications = useMemo(() => notifications, [notifications]);

  return (
    <div className="space-y-8">
      <SectionHeader title="Notifications" subtitle="Alerts and reminders" />

      <div className="glass-card rounded-[32px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Notification center</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Manage alerts</h3>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={markAllRead} className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
              Mark all read
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr]">
          <aside className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Filter</p>
              <select
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value);
                  loadNotifications({ type: event.target.value, q: search });
                }}
                className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500"
              >
                <option value="">All types</option>
                {Object.entries(notificationLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Search</p>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && loadNotifications({ type: typeFilter, q: event.target.value })}
                placeholder="Title or message"
                className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500"
              />
            </div>
          </aside>

          <section className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500">No notifications found.</div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`rounded-3xl border p-5 shadow-sm transition ${notification.read ? 'border-slate-200 bg-white' : 'border-indigo-200 bg-indigo-50 shadow-indigo-50'}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] font-semibold ${notificationBadgeColors[notification.type] || 'bg-slate-100 text-slate-600'}`}>
                          {notificationLabels[notification.type] || notification.type}
                        </span>
                        {!notification.read && <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Unread</span>}
                      </div>
                      <p className="text-base font-semibold text-slate-900">{notification.title}</p>
                      <p className="text-sm leading-6 text-slate-600">{notification.message}</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {!notification.read && (
                        <button
                          onClick={() => markRead(notification._id)}
                          className="rounded-3xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification._id)}
                        className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
