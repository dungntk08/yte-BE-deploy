import React from 'react';

interface TableHeaderProps {
  columns: {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
  }[];
}

const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => {
  return (
    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
      <tr>
        {columns.map((col) => (
          <th 
            key={col.key} 
            className={`px-6 py-3 font-medium ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
            style={{ width: col.width }}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
