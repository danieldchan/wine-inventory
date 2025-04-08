"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Role, User } from "@/lib/types"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  impersonateRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@winecellar.com",
    role: "admin" as Role,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Manager User",
    email: "manager@winecellar.com",
    role: "manager" as Role,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Staff User",
    email: "staff@winecellar.com",
    role: "staff" as Role,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const PUBLIC_PATHS = ["/login"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("wineUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Protect routes based on authentication
    if (!isLoading) {
      // If not logged in and not on a public path, redirect to login
      if (!user && !PUBLIC_PATHS.includes(pathname)) {
        router.push("/login")
      }
      // If logged in and on login page, redirect to dashboard
      else if (user && pathname === "/login") {
        router.push("/dashboard")
      }
    }
  }, [user, pathname, isLoading, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, we would make an API call here
      // For demo purposes, we'll use the mock data
      const foundUser = MOCK_USERS.find((u) => u.email === email)

      // Simple validation for demo purposes
      if (!foundUser || password !== "password") {
        throw new Error("Invalid credentials")
      }

      setUser(foundUser)
      localStorage.setItem("wineUser", JSON.stringify(foundUser))
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("wineUser")
    router.push("/login")
  }

  const impersonateRole = (role: Role) => {
    const impersonatedUser = MOCK_USERS.find((u) => u.role === role) || null
    setUser(impersonatedUser)
    if (impersonatedUser) {
      localStorage.setItem("wineUser", JSON.stringify(impersonatedUser))
    } else {
      localStorage.removeItem("wineUser")
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, impersonateRole }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

