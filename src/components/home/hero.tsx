"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section
      className="relative w-full h-[600px] md:h-[700px] overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full"
      >
        <Image
          src="/images/equipment/hero-banner-v2.jpg"
          alt="Construction equipment at a rental site"
          className="w-full h-full object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 600px"
          priority
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="mb-6 text-4xl md:text-6xl font-bold tracking-tight text-foreground"
        >
          Rent Quality Equipment Without Owning It
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
          className="mb-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          A premium equipment rental marketplace connecting you with verified
          equipment owners for affordable, flexible rentals across construction,
          photography, vehicles, agriculture, electronics, and events.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/equipment"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-lg font-medium rounded-lg hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Browse All Equipment
          </Link>
          <Link
            href="#how-it-works"
            className="flex items-center justify-center gap-2 px-8 py-4 border border-border bg-background text-foreground text-lg font-medium rounded-lg hover:bg-muted transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            How It Works
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
