"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowDown, ArrowLeftRight, ArrowUp, ChevronDown, Filter, Search, ShoppingCart } from "lucide-react"
import type { Movement, MovementType } from "@/lib/types"
import { mockMovements } from "@/lib/mock-data"
import Link from "next/link"
import { format, subDays } from "date-fns"

// Helper function to format dates
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "MMM d, yyyy h:mm a")
}

// Function to get badge color and icon based on movement type
const getMovementBadgeProps = (type: MovementType) => {
  switch (type) {
    case "in":
      return {
        variant: "outline" as const,
        className: "bg-green-50 text-green-600 hover:bg-green-50 border-green-200",
        icon: <ArrowDown className="mr-1 h-3 w-3" />,
      }
    case "out":
      return {
        variant: "outline" as const,
        className: "bg-orange-50 text-orange-600 hover:bg-orange-50 border-orange-200",
        icon: <ArrowUp className="mr-1 h-3 w-3" />,
      }
    case "transfer":
      return {
        variant: "outline" as const,
        className: "bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-200",
        icon: <ArrowLeftRight className="mr-1 h-3 w-3" />,
      }
    case "sale":
      return {
        variant: "outline" as const,
        className: "bg-purple-50 text-purple-600 hover:bg-purple-50 border-purple-200",
        icon: <ShoppingCart className="mr-1 h-3 w-3" />,
      }
  }
}

// Predefined date filters
const dateFilters = [
  { label: "All Time", value: "all" },
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
]

export default function MovementsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>(mockMovements)
  const [movementTypes, setMovementTypes] = useState<MovementType[]>([])
  const [selectedMovementTypes, setSelectedMovementTypes] = useState<MovementType[]>([])
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all")

  // Extract unique movement types
  useEffect(() => {
    const uniqueTypes = Array.from(new Set(mockMovements.map((movement) => movement.type)))
    setMovementTypes(uniqueTypes)
  }, [])

  // Filter movements based on search term, movement types, and date
  useEffect(() => {
    let filtered = [...mockMovements]

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (movement) =>
          movement.wineName.toLowerCase().includes(lowerCaseSearch) ||
          movement.vintage.toString().includes(lowerCaseSearch) ||
          (movement.fromLocationName && movement.fromLocationName.toLowerCase().includes(lowerCaseSearch)) ||
          (movement.toLocationName && movement.toLocationName.toLowerCase().includes(lowerCaseSearch)) ||
          movement.userName.toLowerCase().includes(lowerCaseSearch),
      )
    }

    // Apply movement type filter
    if (selectedMovementTypes.length > 0) {
      filtered = filtered.filter((movement) => selectedMovementTypes.includes(movement.type))
    }

    // Apply date filter
    if (selectedDateFilter !== "all") {
      const now = new Date()
      let cutoffDate: Date

      switch (selectedDateFilter) {
        case "24h":
          cutoffDate = subDays(now, 1)
          break
        case "7d":
          cutoffDate = subDays(now, 7)
          break
        case "30d":
          cutoffDate = subDays(now, 30)
          break
        default:
          cutoffDate = new Date(0) // Beginning of time
      }

      filtered = filtered.filter((movement) => new Date(movement.createdAt) >= cutoffDate)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredMovements(filtered)
  }, [searchTerm, selectedMovementTypes, selectedDateFilter])

  const toggleMovementType = (type: MovementType) => {
    setSelectedMovementTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Movement Log</h1>
        <p className="text-muted-foreground">Track all movement activity in your inventory</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movements</CardTitle>
          <CardDescription>All stock movements including additions, transfers, and sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search movements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Type
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {movementTypes.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={selectedMovementTypes.includes(type)}
                      onCheckedChange={() => toggleMovementType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Date
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {dateFilters.map((filter) => (
                    <DropdownMenuCheckboxItem
                      key={filter.value}
                      checked={selectedDateFilter === filter.value}
                      onCheckedChange={() => setSelectedDateFilter(filter.value)}
                    >
                      {filter.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {(selectedMovementTypes.length > 0 || selectedDateFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedMovementTypes([])
                    setSelectedDateFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Wine</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => {
                    const badgeProps = getMovementBadgeProps(movement.type)

                    // Determine location display based on movement type
                    let locationDisplay = ""
                    if (movement.type === "in") {
                      locationDisplay = `To: ${movement.toLocationName || "Unknown"}`
                    } else if (movement.type === "out" || movement.type === "sale") {
                      locationDisplay = `From: ${movement.fromLocationName || "Unknown"}`
                    } else if (movement.type === "transfer") {
                      locationDisplay = `${movement.fromLocationName || "Unknown"} → ${movement.toLocationName || "Unknown"}`
                    }

                    return (
                      <TableRow key={movement.id}>
                        <TableCell className="font-medium">{formatDate(movement.createdAt)}</TableCell>
                        <TableCell>
                          <Link href={`/wines/${movement.wineId}`} className="text-primary hover:underline">
                            {movement.wineName} ({movement.vintage})
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={badgeProps.variant} className={badgeProps.className}>
                            {badgeProps.icon}
                            {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{movement.quantity}</TableCell>
                        <TableCell>{locationDisplay}</TableCell>
                        <TableCell>{movement.userName}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={movement.notes || ""}>
                          {movement.notes || "-"}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

