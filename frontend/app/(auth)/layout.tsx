import type React from "react"
import AuthLayoutWrapper from "./layout-wrapper"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
}

