"use client"

import { DollarSign, ShieldCheck, Clock, Lock } from "lucide-react"
import { motion } from "framer-motion"

const BENEFITS = [
  {
    title: "Affordable Rental Prices",
    description: "Competitive rental rates on equipment from verified owners across all categories.",
    icon: DollarSign,
  },
  {
    title: "Verified Equipment Owners",
    description: "Equipment owners go through account verification on our platform before listing.",
    icon: ShieldCheck,
  },
  {
    title: "Flexible Rental Periods",
    description: "Choose from daily, weekly, or monthly rental options to fit your project timeline.",
    icon: Clock,
  },
  {
    title: "Secure Payments",
    description: "Payments are processed through our platform with industry-standard encryption.",
    icon: Lock,
  },
] as const

export function WhyChooseUs() {
  return (
    <section className="py-20" id="why-choose-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-8 mb-16">
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
            Why Choose Us
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl"
          >
            Discover the benefits of renting equipment through our platform.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-4 p-6 rounded-xl bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <benefit.icon className="h-6 w-6" />
              </div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-bold text-foreground"
              >
                {benefit.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-sm text-muted-foreground leading-relaxed text-center"
              >
                {benefit.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
