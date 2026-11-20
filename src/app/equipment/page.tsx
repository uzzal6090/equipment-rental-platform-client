import { Suspense } from "react"
import { EquipmentPageClient } from "./EquipmentPageClient"

export default function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return (
    <Suspense fallback={<EquipmentPageSkeleton />}>
      <EquipmentPageClient initialSearchParams={searchParams} />
    </Suspense>
  )
}

function EquipmentPageSkeleton() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-5 w-32 bg-muted rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end mb-8">
          <div className="relative flex-1 sm:w-96">
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="w-full sm:w-48">
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="w-full sm:w-48">
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="w-full sm:w-56">
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="w-full sm:w-48">
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="w-full sm:w-56">
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col h-full">
              <div className="aspect-[4/3] w-full bg-muted rounded-xl animate-pulse" />
              <div className="mt-3 h-5 w-3/4 bg-muted rounded animate-pulse" />
              <div className="mt-2 h-4 w-full bg-muted rounded animate-pulse" />
              <div className="mt-2 h-4 w-1/2 bg-muted rounded animate-pulse" />
              <div className="mt-4 flex justify-between items-baseline">
                <div className="h-7 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              </div>
              <div className="mt-4 h-10 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1 mt-8">
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <span className="px-2 text-muted-foreground">...</span>
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}