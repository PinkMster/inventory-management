'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Warehouse {
  id: number
  name: string
  location: string
  sections: number
  utilization: number
}

export default function WarehousesPage() {
  const [loading, setLoading] = useState(true)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setWarehouses([
        { id: 1, name: '메인 창고', location: '서울시 강남구', sections: 12, utilization: 75 },
        { id: 2, name: '제2 창고', location: '서울시 송파구', sections: 8, utilization: 45 },
        { id: 3, name: '물류센터', location: '경기도 용인시', sections: 24, utilization: 60 },
      ])
      setLoading(false)
    }, 800)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">창고 관리</h1>
        <Link href="/dashboard/warehouses/add" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
          창고 추가
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{warehouse.name}</h2>
              <p className="text-gray-600 mb-4">{warehouse.location}</p>
              
              <div className="flex justify-between text-sm mb-1">
                <span>사용률:</span>
                <span className="font-medium">{warehouse.utilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    warehouse.utilization > 80 ? 'bg-red-500' : 
                    warehouse.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${warehouse.utilization}%` }}
                ></div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <span className="text-sm text-gray-600">구역: {warehouse.sections}개</span>
                <Link href={`/dashboard/warehouses/${warehouse.id}`} className="text-indigo-600 hover:text-indigo-900">
                  세부정보 보기
                </Link>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between">
              <Link href={`/dashboard/warehouses/${warehouse.id}/edit`} className="text-blue-600 hover:text-blue-900">
                수정
              </Link>
              <button className="text-red-600 hover:text-red-900">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}