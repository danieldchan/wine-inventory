"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Wine } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { winesApiService } from "@/lib/api/wines-api-service"
import { WineSKUBase } from "@/lib/api/wines-api-types"

// Form schema for wine creation
const newWineFormSchema = z.object({
  product_code: z
    .string()
    .min(2, { message: "Product code must be at least 2 characters" })
    .max(20, { message: "Product code must not exceed 20 characters" }),
  barcode: z.string().max(20).optional(),
  wine_name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must not exceed 100 characters" }),
  description: z.string().max(1000, { message: "Description must not exceed 1000 characters" }).optional(),
  vintage_year: z.coerce
    .number()
    .int({ message: "Vintage must be a whole number" })
    .min(1900, { message: "Vintage must be 1900 or later" })
    .max(new Date().getFullYear(), { message: `Vintage cannot be later than ${new Date().getFullYear()}` }),
  producer: z
    .string()
    .min(2, { message: "Producer must be at least 2 characters" })
    .max(100, { message: "Producer must not exceed 100 characters" }),
  country: z
    .string()
    .min(2, { message: "Country must be at least 2 characters" })
    .max(100, { message: "Country must not exceed 100 characters" }),
  region: z
    .string()
    .min(2, { message: "Region must be at least 2 characters" })
    .max(100, { message: "Region must not exceed 100 characters" }),
  appellation: z.string().max(100, { message: "Appellation must not exceed 100 characters" }).optional(),
  grape_varieties: z.array(z.string()),
  alcohol_content: z.coerce.number().min(0).max(100),
  bottling_date: z.string().optional(),
  price_bottle: z.coerce.number().min(0, { message: "Price per bottle must be 0 or greater" }),
  price_glass: z.coerce.number().min(0, { message: "Price per glass must be 0 or greater" }),
  cost_price: z.coerce.number().min(0, { message: "Cost price must be 0 or greater" }),
  condition_notes: z.array(z.string())
})

type NewWineFormValues = z.infer<typeof newWineFormSchema>

export default function AddNewWinePage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Protect this page for admin and manager roles only
  if (!user) {
    return null // Don't render anything until user is loaded
  }

  if (user.role !== "admin" && user.role !== "manager") {
    return notFound()
  }

  // Set default form values
  const defaultValues: NewWineFormValues = {
    product_code: "",
    barcode: "",
    wine_name: "",
    description: "",
    vintage_year: new Date().getFullYear(),
    producer: "",
    country: "",
    region: "",
    appellation: "",
    grape_varieties: [],
    alcohol_content: 0,
    bottling_date: "",
    price_bottle: 0,
    price_glass: 0,
    cost_price: 0,
    condition_notes: [],
  }

  const form = useForm<NewWineFormValues>({
    resolver: zodResolver(newWineFormSchema),
    defaultValues,
    mode: "onChange"
  })

  // Add form error handler
  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
    toast({
      title: "Validation Error",
      description: "Please check the form for errors.",
      variant: "destructive",
    });
  };

  async function onSubmit(data: NewWineFormValues) {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true)

    if (!token) {
      console.log('No token found');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add a wine.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Format the data to match backend expectations
      const formattedData: WineSKUBase = {
        ...data,
        grape_varieties: data.grape_varieties || [],
        condition_notes: data.condition_notes || [],
        bottling_date: data.bottling_date ? new Date(data.bottling_date).toISOString() : undefined,
        vintage_year: Number(data.vintage_year),
        alcohol_content: data.alcohol_content ? Number(data.alcohol_content) : 0,
        price_bottle: Number(data.price_bottle),
        price_glass: data.price_glass ? Number(data.price_glass) : 0,
        cost_price: Number(data.cost_price),
      }
      console.log('Formatted data:', formattedData);

      // Use the wine service to create the wine
      const newWine = await winesApiService.createWine(formattedData, token)
      console.log('New wine created:', newWine);

      toast({
        title: "Wine successfully added",
        description: `${newWine.wine_name} (${newWine.vintage_year}) has been added to your inventory.`,
      })

      router.push("/wines")
      router.refresh()
    } catch (error: any) {
      console.error('Error creating wine:', error);
      toast({
        title: "Failed to add wine",
        description: error.message || "There was an error adding the wine. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Wine</h1>
        <p className="text-muted-foreground">Add a new wine SKU to your inventory</p>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <CardHeader>
              <CardTitle>Wine Information</CardTitle>
              <CardDescription>Enter the details of the new wine you want to add</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="product_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Product Code <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CHM-MRG-15" {...field} />
                      </FormControl>
                      <FormDescription>Unique SKU identifier for the wine</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 3760095252021" {...field} />
                      </FormControl>
                      <FormDescription>Official barcode if available</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="wine_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Wine Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Château Margaux" {...field} />
                    </FormControl>
                    <FormDescription>The full name of the wine</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="vintage_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Vintage Year <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>The year the wine was produced</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="producer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Producer <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Château Margaux" {...field} />
                      </FormControl>
                      <FormDescription>The winery that produced the wine</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alcohol_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alcohol Content (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g. 13.5" {...field} />
                      </FormControl>
                      <FormDescription>Alcohol by volume (ABV)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. France" {...field} />
                      </FormControl>
                      <FormDescription>Country of origin</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Region <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bordeaux" {...field} />
                      </FormControl>
                      <FormDescription>Wine region</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appellation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appellation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Margaux AOC" {...field} />
                      </FormControl>
                      <FormDescription>Specific appellation if applicable</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="price_bottle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Price per Bottle ($) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 95.00" {...field} />
                      </FormControl>
                      <FormDescription>Selling price per bottle</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_glass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Glass ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 15.00" {...field} />
                      </FormControl>
                      <FormDescription>Selling price per glass if applicable</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cost Price ($) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 75.00" {...field} />
                      </FormControl>
                      <FormDescription>Purchase price per bottle</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bottling_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bottling Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Date when the wine was bottled</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grape_varieties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grape Varieties</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Cabernet Sauvignon",
                          "Merlot",
                          "Pinot Noir",
                          "Chardonnay",
                          "Sauvignon Blanc",
                          "Syrah/Shiraz",
                          "Tempranillo",
                          "Riesling",
                          "Malbec",
                          "Cabernet Franc",
                        ].map((grape) => (
                          <Badge
                            key={grape}
                            variant="outline"
                            className={`cursor-pointer ${field.value?.includes(grape) ? "bg-champagne-300 text-champagne-950" : "bg-muted"}`}
                            onClick={() => {
                              const currentValues = field.value || []
                              if (currentValues.includes(grape)) {
                                field.onChange(currentValues.filter((v) => v !== grape))
                              } else {
                                field.onChange([...currentValues, grape])
                              }
                            }}
                          >
                            {grape}
                          </Badge>
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>Select all grape varieties used in this wine</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition Notes</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Pristine",
                          "Damaged Label",
                          "Scratched",
                          "Torn Capsule",
                          "Stained Label",
                          "Low Fill Level",
                        ].map((note) => (
                          <Badge
                            key={note}
                            variant="outline"
                            className={`cursor-pointer ${field.value?.includes(note) ? "bg-champagne-300 text-champagne-950" : "bg-muted"}`}
                            onClick={() => {
                              const currentValues = field.value || []
                              if (currentValues.includes(note)) {
                                field.onChange(currentValues.filter((v) => v !== note))
                              } else {
                                field.onChange([...currentValues, note])
                              }
                            }}
                          >
                            {note}
                          </Badge>
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>Select any condition notes for this wine</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the wine's characteristics, tasting notes, etc."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional description of the wine</FormDescription>
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
                    <Wine className="mr-2 h-4 w-4" />
                    Add Wine
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

