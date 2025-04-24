'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated or has demo access
    const demoAccess = localStorage.getItem('demo_access') === 'true'
    
    // If not loading and no user and no demo access, redirect to login
    if (!isLoading && !user && !demoAccess) {
      router.push('/')
    }
  }, [user, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Only render children if we have user or demo access
  const demoAccess = typeof window !== 'undefined' && localStorage.getItem('demo_access') === 'true'
  if (user || demoAccess) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // Fallback empty div while redirecting
  return <div></div>
} 