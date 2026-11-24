"use client"

interface MonthlyBookingChartProps {
  data: Array<{ month: string; bookings: number }>
}

export function MonthlyBookingChart({ data }: MonthlyBookingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Monthly Booking Statistics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Number of bookings per month (last 12 months)
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="font-medium">No booking data available</p>
            <p className="text-sm mt-1">Booking statistics will appear here once data is available</p>
          </div>
        </div>
      </div>
    )
  }

  const validData = data.filter(
    (item) =>
      item &&
      typeof item.month === "string" &&
      typeof item.bookings === "number" &&
      item.bookings >= 0
  )

  if (validData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Monthly Booking Statistics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Number of bookings per month (last 12 months)
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No valid booking data available</p>
            <p className="text-sm mt-1">Unable to process the booking statistics</p>
          </div>
        </div>
      </div>
    )
  }

  const allZero = validData.every((item) => item.bookings === 0)
  if (allZero) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Monthly Booking Statistics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Number of bookings per month (last 12 months)
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">No bookings yet</p>
            <p className="text-sm mt-1">Booking statistics will appear once bookings are made</p>
          </div>
        </div>
      </div>
    )
  }

  const sortedData = [...validData].sort((a, b) => a.month.localeCompare(b.month))
  const maxBookings = Math.max(...sortedData.map((d) => d.bookings), 1)

  const monthLabels = sortedData.map((item) => {
    const [year, month] = item.month.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  })

  // Use CSS variables that respond to theme changes
  const chartStyles = {
    background: "var(--background)",
    foreground: "var(--foreground)",
    muted: "var(--muted)",
    mutedForeground: "var(--muted-foreground)",
    border: "var(--border)",
    primary: "var(--primary)",
    primaryForeground: "var(--primary-foreground)",
    card: "var(--card)",
    cardForeground: "var(--card-foreground)",
  }

  const CHART_HEIGHT = 300
  const MARGIN_LEFT = 50
  const MARGIN_RIGHT = 20
  const MARGIN_TOP = 20
  const MARGIN_BOTTOM = 50
  const BAR_WIDTH = 32
  const BAR_GAP = 16

  const chartWidth = MARGIN_LEFT + MARGIN_RIGHT + sortedData.length * (BAR_WIDTH + BAR_GAP) - BAR_GAP
  const availableHeight = CHART_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM

  return (
    <div className="bg-card border border-border rounded-xl p-6" style={{ background: chartStyles.card, borderColor: chartStyles.border }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold" style={{ color: chartStyles.cardForeground }}>Monthly Booking Statistics</h3>
        <p className="text-sm mt-1" style={{ color: chartStyles.mutedForeground }}>
          Number of bookings per month (last 12 months)
        </p>
      </div>
      <div className="relative w-full" style={{ height: `${CHART_HEIGHT}px` }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          className="w-full h-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Monthly booking statistics vertical bar chart"
          style={{ background: chartStyles.background }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--chart-1)" />
            </linearGradient>
            <linearGradient id="barGradientHover" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--chart-1)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
            <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 0 50 L 50 50 50 0" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>

          <rect
            x={MARGIN_LEFT}
            y={MARGIN_TOP}
            width={sortedData.length * (BAR_WIDTH + BAR_GAP) - BAR_GAP}
            height={availableHeight}
            fill="url(#gridPattern)"
          />

          <g transform={`translate(${MARGIN_LEFT}, ${MARGIN_TOP})`}>
            {/* Y-axis line */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={availableHeight}
              stroke="var(--border)"
              strokeWidth={1}
            />

            {/* X-axis line */}
            <line
              x1={0}
              y1={availableHeight}
              x2={sortedData.length * (BAR_WIDTH + BAR_GAP) - BAR_GAP}
              y2={availableHeight}
              stroke="var(--border)"
              strokeWidth={1}
            />

            {/* Horizontal grid lines and Y-axis labels */}
            {maxBookings > 0 && [0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <g key={ratio}>
                <line
                  x1={0}
                  y1={availableHeight * (1 - ratio)}
                  x2={sortedData.length * (BAR_WIDTH + BAR_GAP) - BAR_GAP}
                  y2={availableHeight * (1 - ratio)}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  strokeDasharray="4,4"
                  opacity={0.3}
                />
                <text
                  x={-10}
                  y={availableHeight * (1 - ratio) + 4}
                  dominantBaseline="middle"
                  textAnchor="end"
                  fill="var(--muted-foreground)"
                  fontSize="11"
                  fontFamily="var(--font-sans)"
                  fontVariant="tabular-nums"
                >
                  {Math.round(ratio * maxBookings)}
                </text>
              </g>
            ))}

            {/* Bars */}
            {sortedData.map((item, index) => {
              const x = index * (BAR_WIDTH + BAR_GAP)
              const barHeight = maxBookings > 0 ? (item.bookings / maxBookings) * availableHeight : 0
              const y = availableHeight - barHeight
              const displayMonth = monthLabels[index]

              return (
                <g key={item.month} className="bar-group">
                  <title>{item.month}: {item.bookings} booking{item.bookings !== 1 ? "s" : ""}</title>
                  
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={barHeight}
                    rx={4}
                    fill="url(#barGradient)"
                    className="bar"
                    style={{
                      transition: "height 0.5s cubic-bezier(0.4, 0, 0.2, 1), y 0.5s cubic-bezier(0.4, 0, 0.2, 1), fill 0.2s ease",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget
                      rect.setAttribute("fill", "url(#barGradientHover)")
                    }}
                    onMouseLeave={(e) => {
                      const rect = e.currentTarget
                      rect.setAttribute("fill", "url(#barGradient)")
                    }}
                  />
                  
                  {/* Month label on X-axis */}
                  <text
                    x={x + BAR_WIDTH / 2}
                    y={availableHeight + 20}
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill="var(--muted-foreground)"
                    fontSize="11"
                    fontWeight={500}
                    fontFamily="var(--font-sans)"
                  >
                    {displayMonth}
                  </text>
                  
                  {/* Booking count on top of bar */}
                  {item.bookings > 0 && (
                    <text
                      x={x + BAR_WIDTH / 2}
                      y={Math.max(y - 8, 16)}
                      dominantBaseline="text-after-edge"
                      textAnchor="middle"
                      fill="var(--foreground)"
                      fontSize="11"
                      fontWeight={600}
                      fontFamily="var(--font-sans)"
                      fontVariant="tabular-nums"
                    >
                      {item.bookings}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>
    </div>
  )
}