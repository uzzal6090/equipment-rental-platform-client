"use client"

import { Search, Truck, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

const STEPS = [
  {
    step: "01",
    title: "Find Equipment",
    description: "Browse our catalog of approved equipment across construction, photography, vehicles, agriculture, electronics, and events.",
    icon: Search,
  },
  {
    step: "02",
    title: "Book Equipment",
    description: "Select your equipment, choose rental dates, and request a booking directly from the equipment owner.",
    icon: Truck,
  },
  {
    step: "03",
    title: "Complete Your Rental",
    description: "Confirm your rental, arrange pickup or delivery, and return the equipment when your rental period ends.",
    icon: CheckCircle2,
  },
] as const

export function HowItWorks() {
  return (
    <section className="py-20" id="how-it-works">
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
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl"
          >
            Renting equipment is simple. Follow these three steps to get started.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative"
            >
              <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-primary font-mono">
                    {step.step}
                  </span>
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg font-bold text-foreground mb-2"
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm text-muted-foreground leading-relaxed flex-1"
                >
                  {step.description}
                </motion.p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <span className="text-xs text-muted-foreground font-medium">
                    Step {parseInt(step.step)} of 3
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}