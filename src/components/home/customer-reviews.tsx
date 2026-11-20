"use client"

import { Star } from "lucide-react"
import { motion } from "framer-motion"
import { HOME_REVIEWS } from "@/constants/reviews"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-primary">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 fill-current ${i < rating ? "text-primary" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  )
}

export function CustomerReviews() {
  return (
    <section className="py-20 bg-muted/50" id="reviews">
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
            Customer Reviews
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl"
          >
            Hear from customers about their rental experience.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {HOME_REVIEWS.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group"
            >
              <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-base font-semibold text-foreground">
                    {review.name}
                  </span>
                  <StarRating rating={review.rating} />
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-muted-foreground italic flex-1 leading-relaxed"
                >
                  {review.comment}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 text-xs text-muted-foreground text-center">
          Reviews shown are customer-submitted feedback and are not
          independently verified testimonials.
        </div>
      </div>
    </section>
  )
}