export function AnomaliesFilters({ filters, onFilterChange, companies = [] }) {
  const handleChange = (e) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-md border border-gray-200 flex flex-wrap gap-4 items-end">
      <div>
        <label
          htmlFor="status-filter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          id="status-filter"
          name="status"
          value={filters.status || ""}
          onChange={handleChange}
          className="block w-full sm:w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>
      {/* Optional Company Filter */}
      {/* <div>
        <label htmlFor="company-filter" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
        <select id="company-filter" name="companyId" value={filters.companyId || ''} onChange={handleChange} className="...">
          <option value="">All Companies</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div> */}
    </div>
  );
}
