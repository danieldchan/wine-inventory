"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, QrCode } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { mockWines, mockLocations, mockStorageLots } from "@/lib/mock-data"

// Form schema for stock addition
const addStockFormSchema = z.object({
  wineId: z.string({
    required_error: "Please select a wine",
  }),
  locationId: z.string({
    required_error: "Please select a location",
  }),
  storageLotId: z.string({
    required_error: "Please select a storage lot",
  }),
  quantity: z.coerce
    .number()
    .int({ message: "Quantity must be a whole number" })
    .positive({ message: "Quantity must be positive" }),
  notes: z.string().max(500).optional(),
})

type AddStockFormValues = z.infer<typeof addStockFormSchema>

// Barcode scan schema
const barcodeScanSchema = z.object({
  barcode: z.string().min(1, { message: "Barcode is required" }),
  quantity: z.coerce
    .number()
    .int({ message: "Quantity must be a whole number" })
    .positive({ message: "Quantity must be positive" }),
  locationId: z.string({
    required_error: "Please select a location",
  }),
  storageLotId: z.string({
    required_error: "Please select a storage lot",
  }),
  notes: z.string().max(500).optional(),
})

type BarcodeScanFormValues = z.infer<typeof barcodeScanSchema>

export default function AddStockPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableStorageLots, setAvailableStorageLots] = useState(mockStorageLots)

  // Create forms
  const manualForm = useForm<AddStockFormValues>({
    resolver: zodResolver(addStockFormSchema),
    defaultValues: {
      wineId: searchParams.get("wineId") || "",
      locationId: "",
      storageLotId: "",
      quantity: 1,
      notes: "",
    },
  })

  const barcodeForm = useForm<BarcodeScanFormValues>({
    resolver: zodResolver(barcodeScanSchema),
    defaultValues: {
      barcode: "",
      quantity: 1,
      locationId: "",
      storageLotId: "",
      notes: "",
    },
  })

  // Filter storage lots based on selected location
  useEffect(() => {
    const locationId = manualForm.watch("locationId")
    if (locationId) {
      const filteredLots = mockStorageLots.filter((lot) => lot.locationId === locationId)
      setAvailableStorageLots(filteredLots)

      // Reset storage lot selection if the current selection doesn't belong to the selected location
      const currentLotId = manualForm.watch("storageLotId")
      if (currentLotId && !filteredLots.some((lot) => lot.id === currentLotId)) {
        manualForm.setValue("storageLotId", "")
      }
    } else {
      setAvailableStorageLots([])
      manualForm.setValue("storageLotId", "")
    }
  }, [manualForm.watch("locationId")])

  // Same for barcode form
  useEffect(() => {
    const locationId = barcodeForm.watch("locationId")
    if (locationId) {
      const filteredLots = mockStorageLots.filter((lot) => lot.locationId === locationId)
      setAvailableStorageLots(filteredLots)

      // Reset storage lot selection if the current selection doesn't belong to the selected location
      const currentLotId = barcodeForm.watch("storageLotId")
      if (currentLotId && !filteredLots.some((lot) => lot.id === currentLotId)) {
        barcodeForm.setValue("storageLotId", "")
      }
    } else {
      setAvailableStorageLots([])
      barcodeForm.setValue("storageLotId", "")
    }
  }, [barcodeForm.watch("locationId")])

  // Handle manual form submission
  async function onManualSubmit(data: AddStockFormValues) {
    setIsSubmitting(true)

    try {
      // In a real application, this would be an API call
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get wine details for the toast
      const wine = mockWines.find((w) => w.id === data.wineId)
      const location = mockLocations.find((l) => l.id === data.locationId)
      const storageLot = mockStorageLots.find((l) => l.id === data.storageLotId)

      // Show success toast
      toast({
        title: "Stock successfully added",
        description: `Added ${data.quantity} units of ${wine?.name} (${wine?.vintage}) to ${location?.name} - ${storageLot?.name}.`,
      })

      // Redirect to the wine details page or reset form
      if (data.wineId) {
        router.push(`/wines/${data.wineId}`)
      } else {
        manualForm.reset({
          wineId: "",
          locationId: "",
          storageLotId: "",
          quantity: 1,
          notes: "",
        })
      }
    } catch (error) {
      // Show error toast
      toast({
        title: "Failed to add stock",
        description: "There was an error adding stock. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle barcode form submission
  async function onBarcodeSubmit(data: BarcodeScanFormValues) {
    setIsSubmitting(true)

    try {
      // In a real application, this would be an API call to lookup the barcode
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, let's assume the barcode corresponds to the first wine
      const wine = mockWines[0]
      const location = mockLocations.find((l) => l.id === data.locationId)
      const storageLot = mockStorageLots.find((l) => l.id === data.storageLotId)

      // Show success toast
      toast({
        title: "Stock successfully added",
        description: `Added ${data.quantity} units of ${wine.name} (${wine.vintage}) to ${location?.name} - ${storageLot?.name}.`,
      })

      // Reset form
      barcodeForm.reset({
        barcode: "",
        quantity: 1,
        locationId: "",
        storageLotId: "",
        notes: "",
      })
    } catch (error) {
      // Show error toast
      toast({
        title: "Failed to add stock",
        description: "There was an error processing the barcode. Please try again or use the manual form.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Stock</h1>
        <p className="text-muted-foreground">Add inventory to your wine collection</p>
      </div>

      <Card>
        <Tabs defaultValue="manual">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Add Stock</CardTitle>
                <CardDescription>Add inventory to your stock</CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="barcode">Barcode Scan</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <TabsContent value="manual">
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(onManualSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={manualForm.control}
                    name="wineId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wine</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a wine" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockWines.map((wine) => (
                              <SelectItem key={wine.id} value={wine.id}>
                                {wine.product_code} - {wine.wine_name} ({wine.vintage_year})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Select the wine you want to add inventory for</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={manualForm.control}
                      name="locationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockLocations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>The storage location</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={manualForm.control}
                      name="storageLotId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage Lot</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!manualForm.watch("locationId")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a storage lot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableStorageLots.map((lot) => (
                                <SelectItem key={lot.id} value={lot.id}>
                                  {lot.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>The specific area within the location</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={manualForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>Number of bottles to add</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional information..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Optional notes about this inventory addition</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Stock
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="barcode">
            <Form {...barcodeForm}>
              <form onSubmit={barcodeForm.handleSubmit(onBarcodeSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={barcodeForm.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <QrCode className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Scan or enter barcode" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>Scan the barcode or enter it manually</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={barcodeForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>Number of bottles to add</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={barcodeForm.control}
                      name="locationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockLocations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>The storage location</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={barcodeForm.control}
                      name="storageLotId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage Lot</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!barcodeForm.watch("locationId")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a storage lot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableStorageLots.map((lot) => (
                                <SelectItem key={lot.id} value={lot.id}>
                                  {lot.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>The specific area within the location</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={barcodeForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional information..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Optional notes about this inventory addition</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-2 h-4 w-4" />
                        Process Barcode
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

