const Table = ({ columns, data }) => (
  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="sticky top-0 bg-slate-50 text-slate-600 shadow-sm">
          <tr>
            {columns.map((column) => (
              <th key={column.accessor} className="whitespace-nowrap px-6 py-4 text-left font-semibold uppercase tracking-[0.18em] text-slate-600">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">No records found</td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 transition hover:bg-slate-100`}>
                {columns.map((column) => (
                  <td key={`${index}-${column.accessor}`} className="min-w-[120px] whitespace-nowrap px-6 py-4 align-top text-slate-700">
                    {column.cell ? column.cell(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default Table;
