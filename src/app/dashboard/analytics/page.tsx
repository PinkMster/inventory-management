'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import InventorySummary from '@/components/analytics/InventorySummary'
import StockLevelChart from '@/components/analytics/StockLevelChart'
import InventoryValueChart from '@/components/analytics/InventoryValueChart'
import LowStockItems from '@/components/analytics/LowStockItems'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inventoryData, setInventoryData] = useState<any[]>([])
  const [warehouseData, setWarehouseData] = useState<any[]>([])
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | '90days' | '1year'>('30days')

  useEffect(() => {
    fetchData()
  }, [timeframe])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch inventory data
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
      
      if (inventoryError) throw inventoryError

      // Fetch warehouse data
      const { data: warehouses, error: warehouseError } = await supabase
        .from('warehouses')
        .select('*, warehouse_sections(*)')
      
      if (warehouseError) throw warehouseError

      setInventoryData(inventory || [])
      setWarehouseData(warehouses || [])
    } catch (error: any) {
      console.error('Error fetching analytics data:', error)
      setError(error.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleTimeframeChange = (newTimeframe: '7days' | '30days' | '90days' | '1year') => {
    setTimeframe(newTimeframe)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">분석</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 전체 현황 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">전체 현황</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">전체 물품</p>
              <p className="text-2xl font-bold">505</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">전체 가치</p>
              <p className="text-2xl font-bold">₩12,548,000</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">평균 회전율</p>
              <p className="text-2xl font-bold">3.2/월</p>
            </div>
          </div>
        </div>

        {/* 재고 현황 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">재고 현황</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>적정 재고</span>
                <span className="font-medium">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-green-500" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>재고 부족</span>
                <span className="font-medium">22%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-yellow-500" style={{ width: '22%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>재고 초과</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-red-500" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/inventory" className="text-blue-600 hover:text-blue-800 text-sm">
              전체 재고 보기 →
            </Link>
          </div>
        </div>

        {/* 창고 현황 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">창고 현황</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">메인 창고</span>
              <span className="text-sm font-medium">75% 사용중</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">제2 창고</span>
              <span className="text-sm font-medium">45% 사용중</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">물류센터</span>
              <span className="text-sm font-medium">60% 사용중</span>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/warehouses" className="text-blue-600 hover:text-blue-800 text-sm">
              전체 창고 보기 →
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">최근 재고 이동</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">위치</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">2023-06-15</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">제품 A</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">입고</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">50</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">메인 창고</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">2023-06-14</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">제품 B</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">출고</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">30</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">제2 창고</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">2023-06-13</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">제품 C</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">이동</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">25</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">메인 창고 → 물류센터</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link href="/dashboard/inventory/movements" className="text-blue-600 hover:text-blue-800 text-sm">
            모든 이동 기록 보기 →
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">보고서</h2>
        <div className="space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
            보고서 생성
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm">
            내보내기
          </button>
        </div>
      </div>
    </div>
  )
} 