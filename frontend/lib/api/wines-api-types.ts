// frontend/api_services/wines-api-types.ts

export interface WineSKUBase {
    product_code: string
    barcode?: string
    wine_name: string
    description?: string
    vintage_year: number
    producer: string
    country: string
    region: string
    appellation?: string
    grape_varieties: string[]
    alcohol_content: number
    bottling_date?: string
    price_bottle: number
    price_glass?: number
    cost_price: number
    condition_notes?: string[]
  }
  
  export interface WineSKU extends WineSKUBase {
    id: string // UUID from backend
    created_at: string // ISO date string
    updated_at: string // ISO date string
  }