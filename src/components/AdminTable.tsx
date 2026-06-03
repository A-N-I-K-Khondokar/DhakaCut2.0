import React from 'react';

export interface TableColumn<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  emptyMessage?: string;
}

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No items found.',
}: AdminTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto border border-gray-150 rounded bg-white shadow-subtle">
      <table className="min-w-full divide-y divide-gray-150">
        {/* Table Header */}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white divide-y divide-gray-150 text-sm text-gray-700">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  <span className="text-xs text-gray-400 font-medium">Loading items...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, itemIndex) => (
              <tr key={keyExtractor(item, itemIndex)} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-gray-900 ${column.className || ''}`}
                  >
                    {column.render 
                      ? column.render(item, itemIndex) 
                      : column.accessor 
                        ? String(item[column.accessor] ?? '')
                        : null
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
