import * as React from "react"
import { useState, useEffect } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ResponsiveTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
}

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      )
    }
    checkTouch()
    window.addEventListener('resize', checkTouch)
    return () => window.removeEventListener('resize', checkTouch)
  }, [])

  return isTouch
}

export function ResponsiveTooltip({
  children,
  content,
  className,
  side = "top",
  align = "center",
  delayDuration = 200,
}: ResponsiveTooltipProps) {
  const isTouchDevice = useIsTouchDevice()

  if (isTouchDevice) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className="cursor-pointer touch-manipulation">
            {children}
          </span>
        </PopoverTrigger>
        <PopoverContent 
          side={side} 
          align={align}
          className={cn(
            "max-w-[min(calc(100vw-32px),320px)] break-words text-sm p-3",
            className
          )}
          collisionPadding={16}
        >
          {content}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className={className}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
