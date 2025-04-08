"use client"

import { useAuth } from "@/lib/auth-context"
import type { Role } from "@/lib/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  BarChart3,
  GlassWater,
  Home,
  ListPlus,
  MoveHorizontal,
  RotateCw,
  Settings,
  User,
  UserCog,
  Wine,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const { user, logout, impersonateRole } = useAuth()
  const pathname = usePathname()

  // If no user, don't render the sidebar
  if (!user) return null

  const navItems = [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          icon: Home,
          href: "/dashboard",
          allowedRoles: ["admin", "manager", "staff"] as Role[],
        },
        {
          title: "Wine List",
          icon: Wine,
          href: "/wines",
          allowedRoles: ["admin", "manager", "staff"] as Role[],
        },
        {
          title: "Movement Log",
          icon: RotateCw,
          href: "/movements",
          allowedRoles: ["admin", "manager", "staff"] as Role[],
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Add New Wine",
          icon: GlassWater,
          href: "/wines/new",
          allowedRoles: ["admin", "manager"] as Role[],
        },
        {
          title: "Add Stock",
          icon: ListPlus,
          href: "/stock/add",
          allowedRoles: ["admin", "manager", "staff"] as Role[],
        },
        {
          title: "Transfer",
          icon: MoveHorizontal,
          href: "/stock/transfer",
          allowedRoles: ["admin", "manager", "staff"] as Role[],
        },
        {
          title: "Reports",
          icon: BarChart3,
          href: "/reports",
          allowedRoles: ["admin", "manager"] as Role[],
        },
      ],
    },
    {
      title: "Admin",
      items: [
        {
          title: "Settings",
          icon: Settings,
          href: "/settings",
          allowedRoles: ["admin"] as Role[],
        },
        {
          title: "User Management",
          icon: UserCog,
          href: "/users",
          allowedRoles: ["admin"] as Role[],
        },
      ],
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="rounded-md bg-champagne-300 p-1">
            <Wine className="h-6 w-6 text-champagne-950" />
          </div>
          <h1 className="text-xl font-bold">Wine Cellar</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navItems.map((group) => {
          // Filter items based on user role
          const filteredItems = group.items.filter((item) => item.allowedRoles.includes(user.role))

          // If no items in this group are allowed for the user's role, don't show the group
          if (filteredItems.length === 0) return null

          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start text-sm">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Role Impersonation</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => impersonateRole("admin")}>Switch to Admin</DropdownMenuItem>
              <DropdownMenuItem onClick={() => impersonateRole("manager")}>Switch to Manager</DropdownMenuItem>
              <DropdownMenuItem onClick={() => impersonateRole("staff")}>Switch to Staff</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

