'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Warehouse } from '@/lib/supabase'
import { Button } from '@/components/ui'

interface WarehouseListProps {
  warehouses: Warehouse[]
  onEdit?: (warehouse: Warehouse) => void
  onDelete?: (warehouse: Warehouse) => void
}

const WarehouseList: React.FC<WarehouseListProps> = ({ 
  warehouses,
  onEdit,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search warehouses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input w-full md:w-1/3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex">
                  <div className="mr-4 p-2 bg-indigo-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{warehouse.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {warehouse.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-gray-100 py-4 my-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Sections</span>
                  <span className="font-medium">{warehouse.sections_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage Capacity</span>
                  <span className="font-medium">{warehouse.capacity || 'Unknown'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <Link 
                  href={`/dashboard/warehouses/${warehouse.id}/sections`} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-center text-sm py-2 px-4 rounded-md transition-colors"
                >
                  View Sections
                </Link>
                <Link 
                  href={`/dashboard/warehouses/${warehouse.id}/inventory`} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-center text-sm py-2 px-4 rounded-md transition-colors"
                >
                  View Inventory
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(warehouse)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDelete(warehouse)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWarehouses.length === 0 && (
        <div className="bg-gray-50 p-6 text-center rounded-lg mt-4">
          <p className="text-gray-600">No warehouses found</p>
        </div>
      )}
    </div>
  )
}

export default WarehouseList