"use client"

import type React from "react"
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

const ScrollIndicator: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Hide when user has scrolled more than 80% of the page
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight
      setIsVisible(scrollPercentage < 0.8)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center">
      <p className="text-[#8dfa91]/60 text-sm mb-2 font-light tracking-wide">Scroll to explore</p>
      <div className="animate-bounce">
        <ChevronDown className="w-6 h-6 text-[#8dfa91]" />
      </div>
    </div>
  )
}

export default ScrollIndicator
