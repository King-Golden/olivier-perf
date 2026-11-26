export type Lang = "fr" | "en"

export type Category =
  | "men"
  | "women"
  | "unisex"
  | "jewelry-women"
  | "jewelry-men"
  | "gifts"

export type ProductType = "perfume" | "jewelry" | "gift"

export type Facet =
  | "oud"
  | "floral"
  | "boise"
  | "ambre"
  | "or18k"
  | "argent925"
  | "acier"
  | "perle"

export type Badge = "new" | "bestseller" | null

export type Concentration = "edp" | "extrait"

export interface Notes {
  top: string[]
  heart: string[]
  base: string[]
}

export interface VolumeOption {
  label: string
  price: number
}

export interface Product {
  id: string
  sku: string
  type: ProductType
  category: Category
  brand: string
  name_fr: string
  name_en: string
  description_fr: string
  description_en: string
  notes_fr?: Notes
  notes_en?: Notes
  material_fr?: string
  material_en?: string
  facets: Facet[]
  price: number
  oldPrice?: number
  stock: number
  images: string[]
  badge: Badge
  visible: boolean
  featured: boolean
  popularity: number
  createdAt: string
  volumes?: VolumeOption[]
  concentrations?: Concentration[]
  extraitSurcharge?: number
  sizes?: string[]
}

export interface CartItem {
  key: string
  productId: string
  qty: number
  unitPrice: number
  volume?: string
  concentration?: Concentration
  size?: string
  giftBox?: boolean
}

export type City = "douala" | "yaounde" | "other" | "pickup"
export type PaymentMethod = "cash" | "momo" | "om"
export type OrderStatus = "new" | "confirmed" | "shipping" | "delivered" | "cancelled"

export interface OrderItem {
  productId: string
  name_fr: string
  name_en: string
  variant: string
  qty: number
  unitPrice: number
}

export interface Order {
  id: string
  ref: string
  createdAt: string
  lang: Lang
  customer: {
    name: string
    phone: string
    city: City
    quartier: string
  }
  payment: PaymentMethod
  giftNote?: string
  items: OrderItem[]
  subtotal: number
  discount: number
  promoCode?: string
  delivery: number
  total: number
  status: OrderStatus
}

export interface PromoCode {
  code: string
  type: "percent" | "fixed"
  value: number
  minOrder: number
  active: boolean
}

export interface DeliverySettings {
  douala: number
  yaounde: number
  other: number
  freeThreshold: number
}

export interface StoreSettings {
  storeName: string
  whatsapp: string
  momoNumber: string
  omNumber: string
  address: string
  hours_fr: string
  hours_en: string
  instagram: string
  tiktok: string
  facebook: string
  pin: string
  apiUrl: string
  apiSecret: string
}
