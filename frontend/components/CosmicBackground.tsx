import type React from "react"

interface CosmicBackgroundProps {
  scrollY: number
}

const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ scrollY }) => {
  const scrollProgress = Math.min(scrollY / (typeof window !== "undefined" ? window.innerHeight * 2 : 1600), 1)
  const nebulaIntensity = Math.min(scrollProgress * 1.2, 1)
  const galaxyOpacity = Math.max(0, (scrollProgress - 0.15) * 1.2)

  return (
    <div className="fixed inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #0f0f1a, #1a1a2e)',
          opacity: nebulaIntensity
        }}
      />
      <div
        className="absolute inset-0 bg-[url('/galaxy.png')] bg-cover bg-center"
        style={{
          opacity: galaxyOpacity
        }}
      />
    </div>
  )
}

export default CosmicBackground
