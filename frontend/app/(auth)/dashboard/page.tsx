"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  ShoppingCart,
  Plus,
  MoveHorizontal,
  TrendingUp,
} from "lucide-react"
import { mockMovements, mockLowStockAlerts } from "@/lib/mock-data"
import Link from "next/link"
import { format } from "date-fns"
import { mockWines } from "@/lib/mock-data"

// Helper function to format dates
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "MMM d, yyyy h:mm a")
}

// Function to get badge color and icon based on movement type
const getMovementBadgeProps = (type: "in" | "out" | "transfer" | "sale") => {
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

export default function DashboardPage() {
  const { user } = useAuth()

  // Get recent movements and sort by date (newest first)
  const recentMovements = [...mockMovements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          {(user?.role === "admin" || user?.role === "manager" || user?.role === "staff") && (
            <Button asChild variant="outline">
              <Link href="/stock/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Link>
            </Button>
          )}
          {(user?.role === "admin" || user?.role === "manager" || user?.role === "staff") && (
            <Button asChild variant="outline">
              <Link href="/stock/transfer">
                <MoveHorizontal className="mr-2 h-4 w-4" />
                Transfer
              </Link>
            </Button>
          )}
          {(user?.role === "admin" || user?.role === "manager") && (
            <Button asChild>
              <Link href="/wines/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Wine
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wines</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,548,731</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,274</div>
            <p className="text-xs text-muted-foreground">+43% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-champagne-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLowStockAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="movements">Recent Movements</TabsTrigger>
          <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>The last 10 movements in your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Wine</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((movement) => {
                    const badgeProps = getMovementBadgeProps(movement.type)

                    // Find the wine to get the updated information
                    const wine = mockWines.find((w) => w.id === movement.wineId)

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
                            {wine
                              ? `${wine.wine_name} (${wine.vintage_year})`
                              : `${movement.wineName} (${movement.vintage})`}
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
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/movements">View All Movements</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Wines that are below their minimum threshold</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wine</TableHead>
                    <TableHead>Vintage</TableHead>
                    <TableHead>Current Quantity</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLowStockAlerts.map((alert) => {
                    // Find the wine to get the updated information
                    const wine = mockWines.find((w) => w.id === alert.wineId)

                    return (
                      <TableRow key={alert.wineId}>
                        <TableCell className="font-medium">
                          <Link href={`/wines/${alert.wineId}`} className="text-primary hover:underline">
                            {wine ? wine.wine_name : alert.wineName}
                          </Link>
                        </TableCell>
                        <TableCell>{wine ? wine.vintage_year : alert.vintage}</TableCell>
                        <TableCell>{alert.totalQuantity}</TableCell>
                        <TableCell>{alert.threshold}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-champagne-50 text-champagne-800 hover:bg-champagne-50 border-champagne-200"
                          >
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Low Stock
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/stock/add?wineId=${alert.wineId}`}>
                              <Plus className="mr-1 h-3 w-3" />
                              Add Stock
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

