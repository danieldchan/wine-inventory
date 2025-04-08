export type Role = "admin" | "manager" | "staff"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
}

export interface Wine {
  id: string
  product_code: string
  barcode?: string
  wine_name: string
  description?: string
  vintage_year: number
  producer: string
  country: string
  region: string
  appellation?: string
  grape_varieties?: string[]
  alcohol_content?: number
  bottling_date?: string
  price_bottle: number
  price_glass?: number
  cost_price: number
  condition_notes?: string[]
  totalQuantity: number
  createdAt: string
  updatedAt: string
}

export interface Location {
  id: string
  name: string
  description?: string
}

export interface StorageLot {
  id: string
  name: string
  locationId: string
  locationName: string
  description?: string
}

export interface Stock {
  wineId: string
  locationId: string
  storageLotId: string
  quantity: number
  locationName: string
  storageLotName: string
}

export type MovementType = "in" | "out" | "transfer" | "sale"

export interface Movement {
  id: string
  wineId: string
  wineName: string
  vintage: number
  type: MovementType
  quantity: number
  fromLocationId?: string
  fromLocationName?: string
  fromStorageLotId?: string
  fromStorageLotName?: string
  toLocationId?: string
  toLocationName?: string
  toStorageLotId?: string
  toStorageLotName?: string
  userId: string
  userName: string
  notes?: string
  createdAt: string
}

export interface LowStockAlert {
  wineId: string
  wineName: string
  vintage: number
  totalQuantity: number
  threshold: number
}

