"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { mockWines } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Filter, Plus, Search } from "lucide-react"
import type { Wine } from "@/lib/types"
import Link from "next/link"

export default function WinesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredWines, setFilteredWines] = useState<Wine[]>(mockWines)
  const [regions, setRegions] = useState<string[]>([])
  const [vintages, setVintages] = useState<number[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedVintages, setSelectedVintages] = useState<number[]>([])

  // Extract unique regions and vintages
  useEffect(() => {
    const uniqueRegions = Array.from(new Set(mockWines.map((wine) => wine.region)))
    const uniqueVintages = Array.from(new Set(mockWines.map((wine) => wine.vintage_year)))

    setRegions(uniqueRegions)
    setVintages(uniqueVintages.sort((a, b) => b - a)) // Sort vintages newest first
  }, [])

  // Filter wines based on search term and filters
  useEffect(() => {
    let filtered = [...mockWines]

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (wine) =>
          wine.wine_name.toLowerCase().includes(lowerCaseSearch) ||
          wine.product_code.toLowerCase().includes(lowerCaseSearch) ||
          wine.producer.toLowerCase().includes(lowerCaseSearch) ||
          wine.region.toLowerCase().includes(lowerCaseSearch) ||
          wine.vintage_year.toString().includes(lowerCaseSearch),
      )
    }

    // Apply region filter
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((wine) => selectedRegions.includes(wine.region))
    }

    // Apply vintage filter
    if (selectedVintages.length > 0) {
      filtered = filtered.filter((wine) => selectedVintages.includes(wine.vintage_year))
    }

    // Sort by name
    filtered.sort((a, b) => a.wine_name.localeCompare(b.wine_name))

    setFilteredWines(filtered)
  }, [searchTerm, selectedRegions, selectedVintages])

  const toggleRegion = (region: string) => {
    setSelectedRegions((prevSelected) =>
      prevSelected.includes(region) ? prevSelected.filter((r) => r !== region) : [...prevSelected, region],
    )
  }

  const toggleVintage = (vintage: number) => {
    setSelectedVintages((prevSelected) =>
      prevSelected.includes(vintage) ? prevSelected.filter((v) => v !== vintage) : [...prevSelected, vintage],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wine List</h1>
          <p className="text-muted-foreground">Manage and browse your wine inventory</p>
        </div>
        {(user?.role === "admin" || user?.role === "manager") && (
          <Button asChild>
            <Link href="/wines/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Wine
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wines</CardTitle>
          <CardDescription>View all wines in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wines..."
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
                    Region
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Region</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {regions.map((region) => (
                    <DropdownMenuCheckboxItem
                      key={region}
                      checked={selectedRegions.includes(region)}
                      onCheckedChange={() => toggleRegion(region)}
                    >
                      {region}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Vintage
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Vintage</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {vintages.map((vintage) => (
                    <DropdownMenuCheckboxItem
                      key={vintage}
                      checked={selectedVintages.includes(vintage)}
                      onCheckedChange={() => toggleVintage(vintage)}
                    >
                      {vintage}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {(selectedRegions.length > 0 || selectedVintages.length > 0) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedRegions([])
                    setSelectedVintages([])
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
                  <TableHead>Product Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Vintage</TableHead>
                  <TableHead>Producer</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Price (Bottle)</TableHead>
                  <TableHead className="text-right">Total Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWines.map((wine) => (
                    <TableRow key={wine.id}>
                      <TableCell className="font-medium">{wine.product_code}</TableCell>
                      <TableCell>
                        <Link href={`/wines/${wine.id}`} className="text-primary hover:underline">
                          {wine.wine_name}
                        </Link>
                      </TableCell>
                      <TableCell>{wine.vintage_year}</TableCell>
                      <TableCell>{wine.producer}</TableCell>
                      <TableCell>{wine.region}</TableCell>
                      <TableCell>${wine.price_bottle.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{wine.totalQuantity}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

