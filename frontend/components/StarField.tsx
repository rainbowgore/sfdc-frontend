"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  driftSpeed: number
}

interface StarFieldProps {
  scrollY: number
}

export default function StarField({ scrollY }: StarFieldProps) {
  const [stars, setStars] = useState<Star[]>([])
  const [time, setTime] = useState(0)

  useEffect(() => {
    const newStars: Star[] = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 3 + 1,
      driftSpeed: Math.random() * 0.5 + 0.2,
    }))
    setStars(newStars)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 0.01), 50)
    return () => clearInterval(interval)
  }, [])

  const scrollProgress = Math.min(scrollY / (typeof window !== "undefined" ? window.innerHeight * 2 : 1600), 1)

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x + Math.sin(time * star.driftSpeed) * 0.5}%`,
            top: `${star.y + Math.cos(time * star.driftSpeed * 0.8) * 0.3}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity * (0.3 + scrollProgress * 0.7),
            transform: `translateY(${-scrollProgress * 20}px)`,
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.5})`,
          }}
        />
      ))}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% ${50 + scrollY * 0.1}%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)`,
        }}
      />
    </div>
  )
}
