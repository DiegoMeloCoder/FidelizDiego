/**
 * A component that renders filter controls for the anomalies list.
 * @param {object} filters - The current filter state object.
 * @param {function} onFilterChange - A function to call when any filter value changes.
 * @param {object[]} [companies=[]] - An optional array of company objects for a company filter dropdown.
 */
export function AnomaliesFilters({ filters, onFilterChange }) {
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
          className="block w-full sm:w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-xs focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>

      {/* This is a placeholder for a company filter. 
        It can be enabled by passing a list of companies to this component.
      */}
      {/* 
        <div>
            <label htmlFor="company-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Company
            </label>
            <select 
            id="company-filter" 
            name="companyId" 
            value={filters.companyId || ''} 
            onChange={handleChange}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-xs focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
            <option value="">All Companies</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
        </div> 
      */}
    </div>
  );
}

export default AnomaliesFilters;
