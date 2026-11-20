"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { HOME_CATEGORIES } from "@/constants/categories"

export function Categories() {
  return (
    <section className="py-20 bg-muted/50" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-8 w-32 bg-border rounded-full"
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Browse Categories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl"
          >
            Explore our curated selection of equipment across six categories.
            Find exactly what you need for your next project.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
{HOME_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative"
            >
              <Link
                href={`/equipment?category=${encodeURIComponent(category.name)}`}
                className="block h-64 rounded-xl overflow-hidden"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 400px"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-bold text-foreground"
                  >
                    {category.name}
                  </motion.h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
