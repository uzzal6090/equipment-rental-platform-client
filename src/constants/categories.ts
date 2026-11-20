import { Truck, Camera, Building2, Tractor, Smartphone, Calendar } from "lucide-react"

export const HOME_CATEGORIES = [
  {
    id: "construction-equipment",
    name: "Construction Equipment",
    description: "Heavy machinery and tools for building projects",
    icon: Truck,
    image: "/images/equipment/excavator.jpg",
  },
  {
    id: "photography-equipment",
    name: "Photography Equipment",
    description: "Cameras, lenses, and lighting for creators",
    icon: Camera,
    image: "/images/equipment/camera-kit.jpg",
  },
  {
    id: "vehicles-transportation",
    name: "Vehicles & Transportation",
    description: "Vans, trucks, and transport vehicles",
    icon: Building2,
    image: "/images/equipment/cargo-van.jpg",
  },
  {
    id: "agriculture-equipment",
    name: "Agriculture Equipment",
    description: "Tractors, harvesters, and farming tools",
    icon: Tractor,
    image: "/images/equipment/generator.jpg",
  },
  {
    id: "electronics",
    name: "Electronics",
    description: "Audio, video, and electronic equipment",
    icon: Smartphone,
    image: "/images/equipment/electronics.jpg",
  },
  {
    id: "event-equipment",
    name: "Event Equipment",
    description: "Tents, staging, and event supplies",
    icon: Calendar,
    image: "/images/equipment/event-equipment.jpg",
  },
] as const

export type CategoryId = (typeof HOME_CATEGORIES)[number]["id"]
