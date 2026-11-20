"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export function AboutSection() {
  return (
    <section className="py-20 bg-muted/50" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row gap-12 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:w-1/2"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 text-2xl font-bold tracking-tight text-foreground"
            >
              About Equipment Rental Platform
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 text-muted-foreground leading-relaxed"
            >
              Equipment Rental Platform is a marketplace that connects people who
              need equipment with verified equipment owners. Whether you&apos;re
              working on a construction project, a photography shoot, or an
              event, our platform helps you find and rent the equipment you need
              without the cost of ownership.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/equipment"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-lg font-medium rounded-lg hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Browse Equipment
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:w-1/2 flex items-center justify-center"
          >
            <div className="relative h-64 w-full lg:h-full lg:w-64 rounded-xl bg-muted overflow-hidden">
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <span className="text-muted-foreground text-lg font-medium">
                  Equipment marketplace
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
