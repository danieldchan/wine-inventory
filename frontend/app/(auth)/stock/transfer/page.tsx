"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, MoveHorizontal, QrCode } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { mockWines, mockLocations, mockStorageLots, mockStocks } from "@/lib/mock-data"

// Form schema for stock transfer
const transferStockFormSchema = z
  .object({
    wineId: z.string({
      required_error: "Please select a wine",
    }),
    fromLocationId: z.string({
      required_error: "Please select a source location",
    }),
    fromStorageLotId: z.string({
      required_error: "Please select a source storage lot",
    }),
    toLocationId: z.string({
      required_error: "Please select a destination location",
    }),
    toStorageLotId: z.string({
      required_error: "Please select a destination storage lot",
    }),
    quantity: z.coerce
      .number()
      .int({ message: "Quantity must be a whole number" })
      .positive({ message: "Quantity must be positive" }),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId || data.fromStorageLotId !== data.toStorageLotId, {
    message: "Source and destination cannot be the same",
    path: ["toLocationId"],
  })

type TransferStockFormValues = z.infer<typeof transferStockFormSchema>

// Barcode scan schema
const barcodeScanSchema = z
  .object({
    barcode: z.string().min(1, { message: "Barcode is required" }),
    fromLocationId: z.string({
      required_error: "Please select a source location",
    }),
    fromStorageLotId: z.string({
      required_error: "Please select a source storage lot",
    }),
    toLocationId: z.string({
      required_error: "Please select a destination location",
    }),
    toStorageLotId: z.string({
      required_error: "Please select a destination storage lot",
    }),
    quantity: z.coerce
      .number()
      .int({ message: "Quantity must be a whole number" })
      .positive({ message: "Quantity must be positive" }),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId || data.fromStorageLotId !== data.toStorageLotId, {
    message: "Source and destination cannot be the same",
    path: ["toLocationId"],
  })

type BarcodeScanFormValues = z.infer<typeof barcodeScanSchema>

export default function TransferStockPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fromStorageLots, setFromStorageLots] = useState(mockStorageLots)
  const [toStorageLots, setToStorageLots] = useState(mockStorageLots)
  const [availableStock, setAvailableStock] = useState<number>(0)

  // Create forms
  const manualForm = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockFormSchema),
    defaultValues: {
      wineId: searchParams.get("wineId") || "",
      fromLocationId: "",
      fromStorageLotId: "",
      toLocationId: "",
      toStorageLotId: "",
      quantity: 1,
      notes: "",
    },
  })

  const barcodeForm = useForm<BarcodeScanFormValues>({
    resolver: zodResolver(barcodeScanSchema),
    defaultValues: {
      barcode: "",
      fromLocationId: "",
      fromStorageLotId: "",
      toLocationId: "",
      toStorageLotId: "",
      quantity: 1,
      notes: "",
    },
  })

  // Filter source storage lots based on selected location
  useEffect(() => {
    const locationId = manualForm.watch("fromLocationId")
    if (locationId) {
      const filteredLots = mockStorageLots.filter((lot) => lot.locationId === locationId)
      setFromStorageLots(filteredLots)

      // Reset storage lot selection if the current selection doesn't belong to the selected location
      const currentLotId = manualForm.watch("fromStorageLotId")
      if (currentLotId && !filteredLots.some((lot) => lot.id === currentLotId)) {
        manualForm.setValue("fromStorageLotId", "")
      }
    } else {
      setFromStorageLots([])
      manualForm.setValue("fromStorageLotId", "")
    }
  }, [manualForm.watch("fromLocationId")])

  // Filter destination storage lots based on selected location
  useEffect(() => {
    const locationId = manualForm.watch("toLocationId")
    if (locationId) {
      const filteredLots = mockStorageLots.filter((lot) => lot.locationId === locationId)
      setToStorageLots(filteredLots)

      // Reset storage lot selection if the current selection doesn't belong to the selected location
      const currentLotId = manualForm.watch("toStorageLotId")
      if (currentLotId && !filteredLots.some((lot) => lot.id === currentLotId)) {
        manualForm.setValue("toStorageLotId", "")
      }
    } else {
      setToStorageLots([])
      manualForm.setValue("toStorageLotId", "")
    }
  }, [manualForm.watch("toLocationId")])

  // Update available stock based on selected wine, location, and storage lot
  useEffect(() => {
    const wineId = manualForm.watch("wineId")
    const locationId = manualForm.watch("fromLocationId")
    const storageLotId = manualForm.watch("fromStorageLotId")

    if (wineId && locationId && storageLotId) {
      // Find stock for the selected wine in the selected location and storage lot
      const stock = mockStocks.find(
        (s) => s.wineId === wineId && s.locationId === locationId && s.storageLotId === storageLotId,
      )

      setAvailableStock(stock?.quantity || 0)

      // If the current quantity is greater than available stock, adjust it
      const currentQuantity = manualForm.watch("quantity")
      if (currentQuantity > (stock?.quantity || 0)) {
        manualForm.setValue("quantity", stock?.quantity || 1)
      }
    } else {
      setAvailableStock(0)
    }
  }, [manualForm.watch("wineId"), manualForm.watch("fromLocationId"), manualForm.watch("fromStorageLotId")])

  // Similar effect for barcode form for from location
  useEffect(() => {
    const locationId = barcodeForm.watch("fromLocationId")
    if (locationId) {
      const filteredLots = mockStorageLots.filter((lot) => lot.locationId === locationId)
      setFromStorageLots(filteredLots)

      const currentLotId = barcodeForm.watch("fromStorageLotId")
      if (currentLotId && !filteredLots.some((lot) => lot.id === currentLotId)) {
        barcodeForm.setValue("fromStorageLotId", "")
      }
    } else {
      setFromStorageLots([])
      barcodeForm.setValue("fromStorageLotId", "")
    }
  }, [barcodeForm.watch("fromLocationId")])

  // Similar effect for barcode form for to location
  useEffect(() => {
    const locationId = barcodeForm.watch("toLocationId")
    if (locationId) {
      const filteredLots = mockStorageLots.filter((lot) => lot.locationId === locationId)
      setToStorageLots(filteredLots)

      const currentLotId = barcodeForm.watch("toStorageLotId")
      if (currentLotId && !filteredLots.some((lot) => lot.id === currentLotId)) {
        barcodeForm.setValue("toStorageLotId", "")
      }
    } else {
      setToStorageLots([])
      barcodeForm.setValue("toStorageLotId", "")
    }
  }, [barcodeForm.watch("toLocationId")])

  // Handle manual form submission
  async function onManualSubmit(data: TransferStockFormValues) {
    setIsSubmitting(true)

    try {
      // In a real application, this would be an API call
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get wine details for the toast
      const wine = mockWines.find((w) => w.id === data.wineId)
      const fromLocation = mockLocations.find((l) => l.id === data.fromLocationId)
      const fromStorageLot = mockStorageLots.find((l) => l.id === data.fromStorageLotId)
      const toLocation = mockLocations.find((l) => l.id === data.toLocationId)
      const toStorageLot = mockStorageLots.find((l) => l.id === data.toStorageLotId)

      // Show success toast
      toast({
        title: "Stock successfully transferred",
        description: `Transferred ${data.quantity} units of ${wine?.name} (${wine?.vintage}) from ${fromLocation?.name} - ${fromStorageLot?.name} to ${toLocation?.name} - ${toStorageLot?.name}.`,
      })

      // Redirect to the wine details page or reset form
      if (data.wineId) {
        router.push(`/wines/${data.wineId}`)
      } else {
        manualForm.reset({
          wineId: "",
          fromLocationId: "",
          fromStorageLotId: "",
          toLocationId: "",
          toStorageLotId: "",
          quantity: 1,
          notes: "",
        })
      }
    } catch (error) {
      // Show error toast
      toast({
        title: "Failed to transfer stock",
        description: "There was an error transferring stock. Please try again.",
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
      const fromLocation = mockLocations.find((l) => l.id === data.fromLocationId)
      const fromStorageLot = mockStorageLots.find((l) => l.id === data.fromStorageLotId)
      const toLocation = mockLocations.find((l) => l.id === data.toLocationId)
      const toStorageLot = mockStorageLots.find((l) => l.id === data.toStorageLotId)

      // Show success toast
      toast({
        title: "Stock successfully transferred",
        description: `Transferred ${data.quantity} units of ${wine.name} (${wine.vintage}) from ${fromLocation?.name} - ${fromStorageLot?.name} to ${toLocation?.name} - ${toStorageLot?.name}.`,
      })

      // Reset form
      barcodeForm.reset({
        barcode: "",
        fromLocationId: "",
        fromStorageLotId: "",
        toLocationId: "",
        toStorageLotId: "",
        quantity: 1,
        notes: "",
      })
    } catch (error) {
      // Show error toast
      toast({
        title: "Failed to transfer stock",
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
        <h1 className="text-3xl font-bold tracking-tight">Transfer Stock</h1>
        <p className="text-muted-foreground">Move inventory between locations</p>
      </div>

      <Card>
        <Tabs defaultValue="manual">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Transfer Stock</CardTitle>
                <CardDescription>Move inventory between locations</CardDescription>
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
                        <FormDescription>Select the wine you want to transfer</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                      <h3 className="font-medium">From</h3>

                      <FormField
                        control={manualForm.control}
                        name="fromLocationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Location</FormLabel>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={manualForm.control}
                        name="fromStorageLotId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Storage Lot</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={!manualForm.watch("fromLocationId")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a storage lot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fromStorageLots.map((lot) => (
                                  <SelectItem key={lot.id} value={lot.id}>
                                    {lot.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-6">
                      <h3 className="font-medium">To</h3>

                      <FormField
                        control={manualForm.control}
                        name="toLocationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination Location</FormLabel>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={manualForm.control}
                        name="toStorageLotId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination Storage Lot</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={!manualForm.watch("toLocationId")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a storage lot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {toStorageLots.map((lot) => (
                                  <SelectItem key={lot.id} value={lot.id}>
                                    {lot.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={manualForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max={availableStock > 0 ? availableStock : undefined}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of bottles to transfer {availableStock > 0 && `(Maximum: ${availableStock})`}
                        </FormDescription>
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
                        <FormDescription>Optional notes about this transfer</FormDescription>
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
                        Transferring...
                      </>
                    ) : (
                      <>
                        <MoveHorizontal className="mr-2 h-4 w-4" />
                        Transfer Stock
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

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                      <h3 className="font-medium">From</h3>

                      <FormField
                        control={barcodeForm.control}
                        name="fromLocationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Location</FormLabel>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={barcodeForm.control}
                        name="fromStorageLotId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Storage Lot</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={!barcodeForm.watch("fromLocationId")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a storage lot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fromStorageLots.map((lot) => (
                                  <SelectItem key={lot.id} value={lot.id}>
                                    {lot.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-6">
                      <h3 className="font-medium">To</h3>

                      <FormField
                        control={barcodeForm.control}
                        name="toLocationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination Location</FormLabel>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={barcodeForm.control}
                        name="toStorageLotId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination Storage Lot</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={!barcodeForm.watch("toLocationId")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a storage lot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {toStorageLots.map((lot) => (
                                  <SelectItem key={lot.id} value={lot.id}>
                                    {lot.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={barcodeForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>Number of bottles to transfer</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                        <FormDescription>Optional notes about this transfer</FormDescription>
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

