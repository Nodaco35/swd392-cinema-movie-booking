import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/auth'

const AuthContext = createContext(null)

const STORAGE_KEY = 'cinema_booking_auth_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.role === 'customer') {
          setUser(parsed)
        }
      }
    } catch {
      // ignore parse errors and start with a clean session
    } finally {
      setInitializing(false)
    }
  }, [])

  const persistUser = (nextUser) => {
    setUser(nextUser)
    if (nextUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login: async (credentials) => {
        const loggedIn = await apiLogin(credentials)
        if (loggedIn.role !== 'customer') {
          throw new Error('Only customer logins are allowed in this phase.')
        }
        persistUser(loggedIn)
        return loggedIn
      },
      logout: () => {
        persistUser(null)
      },
      register: async (data) => {
        const created = await apiRegister(data)
        persistUser(created)
        return created
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

