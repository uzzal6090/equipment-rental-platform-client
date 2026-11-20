export const ALLOWED_CATEGORIES = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
] as const

export const ALLOWED_RENTAL_TYPES = ["daily", "weekly", "monthly"] as const

export const ALLOWED_CONDITIONS = ["new", "excellent", "good", "fair", "poor"] as const

export type Category = (typeof ALLOWED_CATEGORIES)[number]
export type RentalType = (typeof ALLOWED_RENTAL_TYPES)[number]
export type Condition = (typeof ALLOWED_CONDITIONS)[number]