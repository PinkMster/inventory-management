import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface LowStockItemsProps {
  inventoryData: any[]
}

const LowStockItems: React.FC<LowStockItemsProps> = ({ inventoryData }) => {
  const t = useTranslations('dashboard.analytics.lowStock')

  // Calculate low stock items
  const lowStockItems = useMemo(() => {
    // Filter items that are at or below minimum stock level
    return inventoryData
      .filter(item => item.quantity <= item.min_stock)
      .sort((a, b) => {
        // Sort by ratio of current stock to minimum stock (lowest first)
        const ratioA = a.quantity / a.min_stock
        const ratioB = b.quantity / b.min_stock
        return ratioA - ratioB
      })
      .slice(0, 10) // Limit to 10 items
  }, [inventoryData])

  // Function to calculate stock status color
  const getStockStatusColor = (item: any) => {
    const ratio = item.quantity / item.min_stock
    if (ratio === 0) return 'bg-red-500' // Out of stock
    if (ratio <= 0.5) return 'bg-orange-500' // Critical
    if (ratio <= 1) return 'bg-yellow-500' // Low
    return 'bg-green-500' // Normal
  }

  // Function to get stock status text
  const getStockStatusText = (item: any) => {
    const ratio = item.quantity / item.min_stock
    if (ratio === 0) return t('status.outOfStock')
    if (ratio <= 0.5) return t('status.critical')
    return t('status.low')
  }

  // Function to format numbers for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  if (lowStockItems.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">{t('noLowStock')}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('columns.item')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('columns.category')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('columns.currentStock')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('columns.minimumStock')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('columns.status')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('columns.action')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lowStockItems.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatNumber(item.quantity)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatNumber(item.min_stock)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(item)} text-white`}>
                  {getStockStatusText(item)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-3">
                  {t('actions.adjust')}
                </button>
                <Link href={`/dashboard/inventory?id=${item.id}`} className="text-indigo-600 hover:text-indigo-900">
                  {t('actions.view')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {lowStockItems.length < inventoryData.filter(item => item.quantity <= item.min_stock).length && (
        <div className="text-center mt-4">
          <Link href="/dashboard/inventory?filter=low-stock" className="text-sm text-blue-600 hover:text-blue-800">
            {t('actions.viewAll')} →
          </Link>
        </div>
      )}
    </div>
  )
}

export default LowStockItems 