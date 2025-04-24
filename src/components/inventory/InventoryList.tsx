'use client'

import { useState, useEffect, useMemo } from 'react'
import { Inventory } from '@/lib/supabase'

interface InventoryListProps {
  items: Inventory[]
  onEdit?: (item: Inventory) => void
  onDelete?: (item: Inventory) => void
  dictionary: any
}

export default function InventoryList({ 
  items, 
  onEdit, 
  onDelete, 
  dictionary 
}: InventoryListProps) {
  // Sorting state
  const [sortField, setSortField] = useState<keyof Inventory>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'normal' | 'overstock'>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Extract unique categories
  const categories = useMemo(() => {
    const categoryMap: Record<string, boolean> = {}
    items.forEach(item => {
      if (item.category) {
        categoryMap[item.category] = true
      }
    })
    return Object.keys(categoryMap).sort()
  }, [items])

  // Apply search and filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Text search
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Category filter
      const matchesCategory = selectedCategory === '' || item.category === selectedCategory
      
      // Stock level filter
      let matchesStockLevel = true
      switch (stockFilter) {
        case 'low':
          matchesStockLevel = item.quantity <= item.min_stock
          break
        case 'normal':
          matchesStockLevel = item.quantity > item.min_stock && item.quantity <= item.min_stock * 2
          break
        case 'overstock':
          matchesStockLevel = item.quantity > item.min_stock * 2
          break
      }
      
      return matchesSearch && matchesCategory && matchesStockLevel
    })
  }, [items, searchQuery, selectedCategory, stockFilter])

  // Apply sorting
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue
      }
      
      return 0
    })
  }, [filteredItems, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedItems.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedItems, currentPage, itemsPerPage])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, stockFilter])

  // Sort handler
  const handleSort = (field: keyof Inventory) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: keyof Inventory) => {
    if (field !== sortField) return null
    
    return sortDirection === 'asc' 
      ? <span className="text-blue-500">↑</span> 
      : <span className="text-blue-500">↓</span>
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setStockFilter('all')
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Min Stock', 'Location']
    
    const csvData = sortedItems.map(item => [
      item.sku,
      item.name,
      item.category,
      item.quantity.toString(),
      item.min_stock.toString(),
      item.location
    ])
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Render stock status with badge
  const renderStockStatus = (item: Inventory) => {
    const ratio = item.quantity / item.min_stock
    
    if (item.quantity === 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>
    } else if (item.quantity <= item.min_stock) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Low Stock</span>
    } else if (ratio <= 1.5) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Reorder Soon</span>
    } else if (ratio > 3) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Overstock</span>
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Normal</span>
    }
  }

  return (
    <div>
      <div className="mb-6">
        {/* Search and Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input w-full pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="bg-white border border-gray-300 rounded-md py-2 px-3 flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {(selectedCategory !== '' || stockFilter !== 'all') && (
                <span className="ml-1 bg-blue-500 text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
                  {(selectedCategory !== '' ? 1 : 0) + (stockFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
            
            <button 
              onClick={exportToCSV}
              className="bg-green-600 text-white rounded-md py-2 px-3 flex items-center text-sm font-medium hover:bg-green-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-9 3h14M5 3v16a2 2 0 002 2h10a2 2 0 002-2V3a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
        
        {/* Filters Panel */}
        {isFilterOpen && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-select w-full"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Level</label>
                <select 
                  value={stockFilter} 
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="form-select w-full"
                >
                  <option value="all">All Levels</option>
                  <option value="low">Low Stock</option>
                  <option value="normal">Normal Stock</option>
                  <option value="overstock">Overstock</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 mr-4"
              >
                Clear Filters
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="bg-blue-600 text-white rounded-md py-1.5 px-3 text-sm font-medium hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Results summary */}
        <div className="text-sm text-gray-500">
          Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          {filteredItems.length !== items.length && ` (filtered from ${items.length})`}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sku')}
                >
                  <div className="flex items-center">
                    SKU {getSortIcon('sku')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category {getSortIcon('category')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center">
                    Quantity {getSortIcon('quantity')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('min_stock')}
                >
                  <div className="flex items-center">
                    Min Stock {getSortIcon('min_stock')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={
                      item.quantity <= item.min_stock 
                        ? 'text-red-600' 
                        : item.quantity <= item.min_stock * 1.5 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                    }>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.min_stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStockStatus(item)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(item)} 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(item)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="px-6 py-10 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            {(searchQuery !== '' || selectedCategory !== '' || stockFilter !== 'all') && (
              <button 
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {filteredItems.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center">
              <label className="mr-2 text-sm text-gray-600">Show</label>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="form-select text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="ml-2 text-sm text-gray-600">per page</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages || 1}</span>
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-2 py-1 rounded ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-2 py-1 rounded ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}