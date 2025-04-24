'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface SignOutButtonProps {
  className?: string;
}

export default function SignOutButton({ className = '' }: SignOutButtonProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    // Clear demo access
    localStorage.removeItem('demo_access')
    
    // Clear the demo access cookie
    document.cookie = 'demo_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;'
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button 
      onClick={handleSignOut}
      className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ${className}`}
    >
      Sign Out
    </button>
  )
}