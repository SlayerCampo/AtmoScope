import { useEffect, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { useAppStore } from '../store/useAppStore'

const PLANETS_DATA = {
  Earth: {
    texture: '//unpkg.com/three-globe/example/img/earth-dark.jpg',
    info: 'Habitable zone',
  },
  Mars: {
    texture:
      'https://upload.wikimedia.org/wikipedia/commons/7/7d/Mars_equirectangular_projection.jpg',
    info: 'Cold desert',
  },
  Venus: {
    texture:
      'https://upload.wikimedia.org/wikipedia/commons/1/19/Venus_equirectangular_map.jpg',
    info: 'Toxic atmosphere',
  },
} as const

function GlobeView() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const currentPlanet = useAppStore((state) => state.currentPlanet)
  const setCurrentPlanet = useAppStore((state) => state.setCurrentPlanet)
  const [viewport, setViewport] = useState({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  })
  const [showPlanetMenu, setShowPlanetMenu] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const controls = globeRef.current?.controls()
    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.5
    }
  }, [])

  const handlePlanetTravel = (planetName: keyof typeof PLANETS_DATA) => {
    const globe = globeRef.current
    if (!globe || planetName === currentPlanet) {
      return
    }

    globe.pointOfView({ altitude: 15 }, 400)
    setTimeout(() => {
      setCurrentPlanet(planetName)
      globe.pointOfView({ altitude: 2.5 }, 800)
    }, 400)
  }

  return (
    <div className="relative h-full w-full">
      <Globe
        ref={globeRef}
        width={viewport.width}
        height={viewport.height}
        globeImageUrl={PLANETS_DATA[currentPlanet as keyof typeof PLANETS_DATA]?.texture}
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        backgroundColor="rgba(0,0,0,0)"
        onZoom={(pov) => setShowPlanetMenu(pov.altitude > 3.0)}
      />

      {showPlanetMenu && (
        <div className="absolute top-1/4 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-white shadow-2xl backdrop-blur-md">
          <p className="mb-3 text-center text-sm font-medium text-slate-200">
            Solar System
          </p>
          <div className="flex gap-2">
            {(Object.keys(PLANETS_DATA) as Array<keyof typeof PLANETS_DATA>).map(
              (planet) => (
                <button
                  key={planet}
                  type="button"
                  onClick={() => handlePlanetTravel(planet)}
                  className={`rounded-xl px-4 py-2 text-sm transition ${
                    currentPlanet === planet
                      ? 'bg-cyan-300 text-slate-950'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {planet}
                </button>
              ),
            )}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            {PLANETS_DATA[currentPlanet as keyof typeof PLANETS_DATA]?.info}
          </p>
        </div>
      )}
    </div>
  )
}

export default GlobeView
