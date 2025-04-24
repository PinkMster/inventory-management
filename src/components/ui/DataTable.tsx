import React, { useState } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  cell?: (data: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  isLoading?: boolean;
  pagination?: boolean;
  pageSize?: number;
  showSearch?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  rowClassName?: string | ((item: T) => string);
  headerClassName?: string;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  isLoading = false,
  pagination = false,
  pageSize = 10,
  showSearch = false,
  emptyMessage = "데이터가 없습니다",
  onRowClick,
  className = '',
  rowClassName = '',
  headerClassName = '',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null, direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc'
  });

  // 검색 로직
  const filteredData = searchTerm
    ? data.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // 정렬 로직
  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue === bValue) return 0;
        
        if (sortConfig.direction === 'asc') {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  // 페이지네이션 로직
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const currentData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  // 정렬 처리 함수
  const handleSort = (key: keyof T) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        key,
        direction: 'asc'
      };
    });
  };

  // 행 클래스 계산
  const getRowClassName = (item: T): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(item);
    }
    return rowClassName;
  };

  if (isLoading) {
    return (
      <div className="table-container animate-pulse">
        <div className="h-8 bg-gray-200 mb-4 rounded"></div>
        {Array(5).fill(0).map((_, index) => (
          <div key={index} className="h-12 bg-gray-100 mb-2 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      {showSearch && (
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="검색..."
            className="form-input w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <table className="data-table">
        <thead className={headerClassName}>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                className={column.className}
                onClick={() => column.sortable && typeof column.accessor === 'string' && handleSort(column.accessor)}
              >
                <div className="flex items-center">
                  <span>{column.header}</span>
                  {column.sortable && typeof column.accessor === 'string' && (
                    <span className="ml-1">
                      {sortConfig.key === column.accessor ? (
                        sortConfig.direction === 'asc' ? '▲' : '▼'
                      ) : ''}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            currentData.map(item => (
              <tr 
                key={String(item[keyField])} 
                className={`${getRowClassName(item)} ${onRowClick ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column, cellIndex) => {
                  let cellContent: React.ReactNode;
                  
                  if (column.cell) {
                    cellContent = column.cell(item);
                  } else if (typeof column.accessor === 'function') {
                    cellContent = column.accessor(item);
                  } else {
                    cellContent = item[column.accessor];
                  }
                  
                  return (
                    <td key={cellIndex} className={column.className}>
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-outline py-1 px-2 text-sm disabled:opacity-50"
            >
              이전
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-outline py-1 px-2 text-sm disabled:opacity-50"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                총 <span className="font-medium">{sortedData.length}</span> 항목 중{' '}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>-
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, sortedData.length)}
                </span> 표시 중
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">First</span>
                  ⟪
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  ⟨
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // 현재 페이지를 중심으로 앞뒤로 2페이지씩 표시
                  let pageNum = currentPage - 2 + i;
                  
                  // 페이지 번호가 범위를 벗어날 경우 조정
                  if (pageNum <= 0) pageNum = i + 1;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  ⟩
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Last</span>
                  ⟫
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable; 