import React from 'react'

interface InventorySummaryProps {
  inventoryData: any[]
}

const InventorySummary: React.FC<InventorySummaryProps> = ({ inventoryData }) => {
  // Calculate summary metrics
  const totalItems = inventoryData.length
  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0)
  const totalValueEstimate = inventoryData.reduce((sum, item) => sum + (item.quantity * 50), 0) // Using placeholder value of $50 per item
  const lowStockCount = inventoryData.filter(item => item.quantity <= item.min_stock).length
  
  // Get unique categories using an object as a map
  const categoryMap: Record<string, boolean> = {}
  inventoryData.forEach(item => {
    if (item.category) {
      categoryMap[item.category] = true
    }
  })
  const totalCategories = Object.keys(categoryMap).length

  // Function to format numbers for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Items Card */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">총 항목</p>
            <h4 className="text-2xl font-semibold text-gray-800 mt-1">{formatNumber(totalItems)}</h4>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">{formatNumber(totalCategories)} 카테고리</p>
        </div>
      </div>

      {/* Total Quantity Card */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">총 재고</p>
            <h4 className="text-2xl font-semibold text-gray-800 mt-1">{formatNumber(totalQuantity)}</h4>
          </div>
          <div className="bg-green-100 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">모든 창고</p>
        </div>
      </div>

      {/* Inventory Value Card */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">예상 가치</p>
            <h4 className="text-2xl font-semibold text-gray-800 mt-1">${formatNumber(totalValueEstimate)}</h4>
          </div>
          <div className="bg-purple-100 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">재고 기준</p>
        </div>
      </div>

      {/* Low Stock Card */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">부족 재고</p>
            <h4 className="text-2xl font-semibold text-gray-800 mt-1">{formatNumber(lowStockCount)}</h4>
          </div>
          <div className="bg-red-100 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">주의 필요</p>
        </div>
      </div>
    </div>
  )
}

export default InventorySummary 