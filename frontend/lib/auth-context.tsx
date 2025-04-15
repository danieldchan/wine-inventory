"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Role, User } from "@/lib/types"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  token: string | null
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
  // Set default admin user and token
  const defaultUser = {
    id: "1",
    name: "Admin User",
    email: "admin@winecellar.com",
    role: "admin" as Role,
    avatar: "/placeholder.svg?height=40&width=40",
  }
  const defaultToken = "mock-token-for-development"

  const [user, setUser] = useState<User | null>(defaultUser)
  const [token, setToken] = useState<string | null>(defaultToken)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Remove route protection
  useEffect(() => {
    if (pathname === "/login") {
      router.push("/dashboard")
    }
  }, [pathname, router])

  const login = async (email: string, password: string) => {
    // Auto-login with admin user
    setUser(defaultUser)
    setToken(defaultToken)
    router.push("/dashboard")
  }

  const logout = () => {
    // Keep user logged in
    router.push("/dashboard")
  }

  const impersonateRole = (role: Role) => {
    // Keep admin role
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, impersonateRole }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

