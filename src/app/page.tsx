import { Hero } from "@/components/home/hero"
import { FeaturedEquipment } from "@/components/home/featured-equipment"
import { Categories } from "@/components/home/categories"
import { WhyChooseUs } from "@/components/home/why-choose-us"
import { CustomerReviews } from "@/components/home/customer-reviews"
import { HowItWorks } from "@/components/home/how-it-works"
import { RecentlyAddedEquipment } from "@/components/home/recently-added"
import { AboutSection } from "@/components/home/about-section"
import { ContactSection } from "@/components/home/contact-section"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <main className="flex flex-col flex-1 min-h-screen bg-background">
      <Hero />
      <FeaturedEquipment />
      <Categories />
      <WhyChooseUs />
      <CustomerReviews />
      <HowItWorks />
      <RecentlyAddedEquipment />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
