'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

// Create context for authentication
type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
})

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext)

// Provider component for authentication
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Check demo access
    const demoAccess = localStorage.getItem('demo_access') === 'true'
    
    // Handle initial session and setup auth listener
    const initializeAuth = async () => {
      try {
        // Skip auth check if demo access is enabled
        if (demoAccess) {
          setIsLoading(false)
          return
        }
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        setUser(session?.user || null)
        
        // Set up auth listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setUser(session?.user || null)
          }
        )
        
        // Clean up auth listener
        return () => {
          authListener.subscription.unsubscribe()
        }
      } catch (error) {
        setError(error as Error)
        console.error('Auth error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
} 