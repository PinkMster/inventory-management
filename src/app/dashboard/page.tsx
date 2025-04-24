'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      try {
        // 데모 접근 확인
        const demoAccess = localStorage.getItem('demo_access')
        if (demoAccess === 'true') {
          setUser({ email: 'demo@example.com', name: '데모 사용자' })
          setLoading(false)
          return
        }

        // Supabase 인증 확인
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/')
          return
        }
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || '사용자'
        })
      } catch (error) {
        console.error('사용자 정보 가져오기 오류:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [router])

  const handleSignOut = async () => {
    // 데모 접근 삭제
    localStorage.removeItem('demo_access')
    
    // Supabase 로그아웃
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 네비게이션 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-0">재고 관리 시스템</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-blue-50 py-1 px-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" style={{ width: '20px', height: '20px' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-700">{user?.email}</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
            >
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">환영합니다, {user?.name || '사용자'}</h2>
          <p className="text-gray-600">오늘의 재고 현황과 통계를 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 재고 카드 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold text-blue-800">재고 관리</h3>
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
            <p className="text-gray-700 mb-6">재고 수준을 확인하고 재고 이동을 관리하세요</p>
            <Link href="/dashboard/inventory" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 inline-flex items-center">
              <span>재고 관리하기</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* 창고 카드 */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold text-indigo-800">창고 관리</h3>
              <div className="bg-indigo-500 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-gray-700 mb-6">창고 공간과 위치를 효율적으로 관리하세요</p>
            <Link href="/dashboard/warehouses" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 inline-flex items-center">
              <span>창고 관리하기</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* 분석 카드 */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold text-purple-800">분석</h3>
              <div className="bg-purple-500 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-700 mb-6">재고 및 창고 운영에 대한 상세 분석을 확인하세요</p>
            <Link href="/dashboard/analytics" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 inline-flex items-center">
              <span>분석 보기</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 빠른 작업 섹션 */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">빠른 작업</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/inventory?action=add" className="border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>재고 추가</span>
            </Link>
            <Link href="/dashboard/inventory/movements" className="border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>물품 이동</span>
            </Link>
            <Link href="/dashboard/warehouses?action=add" className="border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>창고 추가</span>
            </Link>
            <Link href="/dashboard/analytics" className="border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span>보고서 생성</span>
            </Link>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} 재고 관리 시스템. 모든 권리 보유.
        </div>
      </footer>
    </div>
  )
}