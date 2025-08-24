import React, { useState } from 'react';

interface Column {
  key: string;
  name: string;
}

interface DataTableProps {
  data: Record<string, any>[];
  columns: Column[];
  rowsPerPage?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  rowsPerPage = 10,
}) => {
  const [page, setPage] = useState(0);

  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedRows = data.slice(start, end);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const goNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const goPrev = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <div className="overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                >
                  {row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
        <button
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={goPrev}
          disabled={page === 0}
        >
          Previous
        </button>

        <span>
          Page {page + 1} of {totalPages}
        </span>

        <button
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={goNext}
          disabled={page === totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataTable;
