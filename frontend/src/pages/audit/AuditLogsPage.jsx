import { useEffect, useMemo, useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import Table from '../../components/Table.jsx';
import { fetchAuditLogs } from '../../services/auditService.js';

const modules = ['AUTH', 'MEDICINE', 'DAMAGED_STOCK', 'RETURN_REQUEST', 'NOTIFICATION'];
const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'COMPLETE'];

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [sort, setSort] = useState('desc');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await fetchAuditLogs({ page, limit, module: moduleFilter, action: actionFilter, q, sort });
      setLogs(resp.data.data || []);
      setTotal(resp.data.meta?.total || 0);
    } catch (err) {
      console.error(err);
      setError('Unable to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, [page, moduleFilter, actionFilter, q, sort]);

  const columns = useMemo(() => [
    { header: 'Date', accessor: 'createdAt', cell: (row) => new Date(row.createdAt).toLocaleString() },
    { header: 'User', accessor: 'userName', cell: (row) => row.userName || row.userId?.name || (row.userId?.name && row.userId.name) || '-' },
    { header: 'Module', accessor: 'module' },
    { header: 'Action', accessor: 'action' },
    { header: 'Description', accessor: 'description', cell: (row) => row.description || row.details }
  ], []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-8">
      <SectionHeader title="Audit Logs" subtitle="Track administrative activity" />

      <div className="glass-card rounded-[32px] p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search logs" className="rounded-3xl border border-slate-300 bg-white px-4 py-2 outline-none" />
            <select value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }} className="rounded-3xl border border-slate-300 bg-white px-3 py-2">
              <option value="">All modules</option>
              {modules.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="rounded-3xl border border-slate-300 bg-white px-3 py-2">
              <option value="">All actions</option>
              {actions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-3xl border border-slate-300 bg-white px-3 py-2">
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="text-center p-6 text-slate-500">Loading...</div>
          ) : error ? (
            <div className="text-center p-6 text-red-600">{error}</div>
          ) : (
            <>
              <Table columns={columns} data={logs} />
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">Showing {logs.length} of {total} records</div>
                <div className="flex items-center gap-2">
                  <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-md px-3 py-2 bg-slate-100 disabled:opacity-50">Prev</button>
                  <div className="px-3">{page} / {totalPages}</div>
                  <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-md px-3 py-2 bg-slate-100 disabled:opacity-50">Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
