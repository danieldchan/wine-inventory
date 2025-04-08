"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, Wine } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export default function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      await login(values.email, values.password)
    } catch (err) {
      setError(
        "Invalid email or password. For demo, use admin@winecellar.com, manager@winecellar.com, or staff@winecellar.com with password 'password'.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Login Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-md bg-primary p-2">
                <Wine className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Wine Inventory Management</h1>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
          </Form>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              Demo users: admin@winecellar.com, manager@winecellar.com, staff@winecellar.com
            </div>
            <div className="text-sm text-muted-foreground text-center">Password for all: password</div>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-full md:w-1/2 bg-background">
        <img
          src="https://cdn.midjourney.com/2cb88cf2-b038-4518-98c9-4760044d9d7d/0_1.png"
          alt="Wine cellar with barrels and bottles"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

