export const HOME_REVIEWS = [
  {
    name: "Nayeem",
    rating: 5,
    comment: "A great rental experience! The equipment was exactly what I needed, and the overall process was smooth and hassle-free.",
  },
  {
    name: "Uzzal",
    rating: 5,
    comment: "I had a wonderful experience using this platform. Finding and renting the right equipment was simple and convenient.",
  },
  {
    name: "Pakhi",
    rating: 5,
    comment: "A helpful platform with a smooth rental process. It made finding the equipment I needed much easier.",
  },
  {
    name: "Moon",
    rating: 5,
    comment: "Very good experience! The platform is easy to use, and the rental process was simple and convenient.",
  },
  {
    name: "Rahim",
    rating: 5,
    comment: "The rental process was simple, and finding the right equipment was easy.",
  },
  {
    name: "Sadia",
    rating: 5,
    comment: "A convenient way to find equipment for different project needs.",
  },
] as const

export type Review = (typeof HOME_REVIEWS)[number]