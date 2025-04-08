"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockWines, mockStocks, mockMovements } from "@/lib/mock-data"
import type { Wine, Stock, Movement } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowLeftRight, ArrowUp, Edit, MoveHorizontal, Plus, ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import { Separator } from "@/components/ui/separator"

export default function WineDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [wine, setWine] = useState<Wine | null>(null)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch wine details
    const fetchWineDetails = () => {
      setIsLoading(true)

      // Find wine by ID
      const foundWine = mockWines.find((w) => w.id === params.id)

      if (foundWine) {
        setWine(foundWine)

        // Get stocks for this wine
        const wineStocks = mockStocks.filter((s) => s.wineId === params.id)
        setStocks(wineStocks)

        // Get movements for this wine
        const wineMovements = mockMovements
          .filter((m) => m.wineId === params.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setMovements(wineMovements)
      }

      setIsLoading(false)
    }

    fetchWineDetails()
  }, [params.id])

  // If wine not found
  if (!isLoading && !wine) {
    return notFound()
  }

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

  return (
    <div className="space-y-6">
      {/* Header section - unchanged */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{wine?.wine_name}</h1>
          <p className="text-muted-foreground">
            {wine?.vintage_year} • {wine?.region}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(user?.role === "admin" || user?.role === "manager" || user?.role === "staff") && (
            <Button asChild variant="outline">
              <Link href={`/stock/add?wineId=${params.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Link>
            </Button>
          )}
          {(user?.role === "admin" || user?.role === "manager" || user?.role === "staff") && (
            <Button asChild variant="outline">
              <Link href={`/stock/transfer?wineId=${params.id}`}>
                <MoveHorizontal className="mr-2 h-4 w-4" />
                Transfer
              </Link>
            </Button>
          )}
          {(user?.role === "admin" || user?.role === "manager") && (
            <Button asChild variant="outline">
              <Link href={`/wines/${params.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {user?.role === "admin" && (
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Wine Details section - updated to full width with grouped fields */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Wine Details</CardTitle>
        </CardHeader>
        <CardContent>
          {wine && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column - Basic Info and Characteristics */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-champagne-600">Basic Info</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-muted-foreground">Product Code</h4>
                      <p>{wine.product_code}</p>
                    </div>
                    {wine.barcode && (
                      <div>
                        <h4 className="font-medium text-muted-foreground">Barcode</h4>
                        <p>{wine.barcode}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-muted-foreground">Name</h4>
                      <p>{wine.wine_name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Vintage</h4>
                      <p>{wine.vintage_year}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Producer</h4>
                      <p>{wine.producer}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Country</h4>
                      <p>{wine.country}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Region</h4>
                      <p>{wine.region}</p>
                    </div>
                    {wine.appellation && (
                      <div>
                        <h4 className="font-medium text-muted-foreground">Appellation</h4>
                        <p>{wine.appellation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Characteristics */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-champagne-600">Characteristics</h3>
                  <div className="space-y-4">
                    {wine.grape_varieties && wine.grape_varieties.length > 0 && (
                      <div>
                        <h4 className="font-medium text-muted-foreground">Grape Varieties</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {wine.grape_varieties.map((grape) => (
                            <Badge
                              key={grape}
                              variant="outline"
                              className="bg-champagne-50 text-champagne-800 border-champagne-200"
                            >
                              {grape}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {wine.alcohol_content && (
                      <div>
                        <h4 className="font-medium text-muted-foreground">Alcohol Content</h4>
                        <p>{wine.alcohol_content}% ABV</p>
                      </div>
                    )}
                    {wine.bottling_date && (
                      <div>
                        <h4 className="font-medium text-muted-foreground">Bottling Date</h4>
                        <p>{new Date(wine.bottling_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-muted-foreground">Description</h4>
                      <p className="text-sm">{wine.description || "No description available."}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Pricing and Condition */}
              <div className="space-y-6">
                {/* Pricing */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-champagne-600">Pricing</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-muted-foreground">Price (Bottle)</h4>
                      <p>${wine.price_bottle.toFixed(2)}</p>
                    </div>
                    {wine.price_glass && (
                      <div>
                        <h4 className="font-medium text-muted-foreground">Price (Glass)</h4>
                        <p>${wine.price_glass.toFixed(2)}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-muted-foreground">Cost Price</h4>
                      <p>${wine.cost_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Total Quantity</h4>
                      <p>{wine.totalQuantity} bottles</p>
                    </div>
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-champagne-600">Condition</h3>
                  <div className="space-y-4">
                    {wine.condition_notes && wine.condition_notes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-muted-foreground">Condition Notes</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {wine.condition_notes.map((note) => (
                            <Badge
                              key={note}
                              variant="outline"
                              className="bg-champagne-50 text-champagne-800 border-champagne-200"
                            >
                              {note}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-muted-foreground">Added On</h4>
                      <p>{formatDate(wine.createdAt)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Last Updated</h4>
                      <p>{formatDate(wine.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Divider between sections */}
      <Separator className="my-2" />

      {/* Inventory Information section - full width with tabs */}
      <Card className="w-full">
        <Tabs defaultValue="stock">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Inventory Information</CardTitle>
            <TabsList>
              <TabsTrigger value="stock">Stock</TabsTrigger>
              <TabsTrigger value="movements">Movement History</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="stock" className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Storage Lot</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No stock information available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stocks.map((stock) => (
                      <TableRow key={`${stock.locationId}-${stock.storageLotId}`}>
                        <TableCell className="font-medium">{stock.locationName}</TableCell>
                        <TableCell>{stock.storageLotName}</TableCell>
                        <TableCell className="text-right">{stock.quantity}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="movements" className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No movement history available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    movements.map((movement) => {
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
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}

