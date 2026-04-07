"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const [scrolling, setScrolling] = React.useState(false)
  const [scrolledFromTop, setScrolledFromTop] = React.useState(false)
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop
    
    // Shows scrollbar when scrolling starts
    setScrolling(true)
    
    // Shows top border if scrolled down from top
    setScrolledFromTop(scrollTop > 0)

    // Clears previous timeout and set a new one to hide after 600ms
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    
    scrollTimeoutRef.current = setTimeout(() => {
      setScrolling(false)
    }, 600)
  }

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      // Always shows scrollbar so Radix doesn't unmount the element, allowing CSS transitions
      type="always"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* Top border that appears when scrolled */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 h-px bg-white/10 transition-opacity duration-300 z-10",
          scrolledFromTop ? "opacity-100" : "opacity-0"
        )}
      />
      <ScrollAreaPrimitive.Viewport 
        onScroll={handleScroll} 
        className="h-full w-full rounded-[inherit]"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {/* Pass the scrolling state down to the scrollbar */}
      <ScrollBar forceVisible={scrolling} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
})
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

interface ScrollBarProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  forceVisible?: boolean
}

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({ className, orientation = "vertical", forceVisible, ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-opacity duration-500 ease-out",
      // If scrolling, opacity 100. Otherwise, opacity 0.
      forceVisible ? "opacity-100" : "opacity-0",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }