import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { useAppStore } from '../store/useAppStore'

const PLANETS_DATA = {
  Sun: {
    texture:
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_4096.jpg',
    realTexture:
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/sun.jpg',
    scale: 5,
    hasRings: false,
    info: 'Center of the solar system.',
  },
  Mercury: {
    texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mercury.jpg',
    scale: 1,
    hasRings: false,
    info: 'No atmosphere. Temp: -173°C to 427°C',
  },
  Venus: {
    texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/venus.jpg',
    scale: 1,
    hasRings: false,
    info: 'Toxic greenhouse effect. Temp: 464°C',
  },
  Earth: {
    texture: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    scale: 1,
    hasRings: false,
    info: 'Habitable zone. Average Temp: 15°C',
  },
  Mars: {
    texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mars.jpg',
    scale: 1,
    hasRings: false,
    info: 'Cold desert. Average Temp: -65°C',
  },
  Jupiter: {
    texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter.jpg',
    scale: 2,
    hasRings: false,
    info: 'Gas giant. Cloud top Temp: -108°C',
  },
  Saturn: {
    texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn.jpg',
    scale: 1.8,
    hasRings: true,
    info: 'Ringed gas giant. Temp: -139°C',
  },
  Uranus: {
    texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/uranus.jpg',
    scale: 1.5,
    hasRings: false,
    info: 'Ice giant. Temp: -195°C',
  },
  Neptune: {
    texture: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/neptune.jpg',
    scale: 1.5,
    hasRings: false,
    info: 'Ice giant. High winds. Temp: -200°C',
  },
} as const

type SceneChild = {
  type: string
  name: string
  intensity?: number
  scale?: { set: (x: number, y: number, z: number) => void }
}

type CountryFeature = {
  properties?: Record<string, unknown>
  [key: string]: unknown
}

type CountryCollection = {
  features: CountryFeature[]
}

function GlobeView() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const pointerDownCoords = useRef({ x: 0, y: 0 })
  const currentPlanet = useAppStore((state) => state.currentPlanet)
  const setCurrentPlanet = useAppStore((state) => state.setCurrentPlanet)
  const setViewMode = useAppStore((state) => state.setViewMode)
  const setSelectedRegionData = useAppStore(
    (state) => state.setSelectedRegionData,
  )
  const [viewport, setViewport] = useState({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  })
  const [showPlanetMenu, setShowPlanetMenu] = useState(false)
  const [countries, setCountries] = useState<CountryCollection>({
    features: [],
  })

  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson',
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load country data: ${response.status}`)
        }
        return response.json() as Promise<CountryCollection>
      })
      .then(setCountries)
  }, [])

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
    const renderer = globeRef.current?.renderer()
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    }
    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.25
    }
  }, [])

  useEffect(() => {
    const scene = globeRef.current?.scene()
    if (scene) {
      ;(scene as SceneChild & { environment?: unknown }).environment = null
    }
    const globeMesh = scene
      ? (scene.children as SceneChild[]).find(
          (child) => child.type === 'Mesh' || child.name === 'globe',
        )
      : undefined
    const scale = PLANETS_DATA[currentPlanet as keyof typeof PLANETS_DATA].scale
    globeMesh?.scale?.set(scale, scale, scale)
  }, [currentPlanet])

  const handlePlanetTravel = async (
    planetName: keyof typeof PLANETS_DATA,
  ) => {
    const globe = globeRef.current
    if (!globe || planetName === currentPlanet) {
      return
    }

    const currentPov = globe.pointOfView()
    globe.pointOfView({ altitude: 8 }, 500)
    await new Promise((resolve) => setTimeout(resolve, 500))
    globe.pointOfView(
      {
        lat: currentPov.lat + 30,
        lng: currentPov.lng + 90,
        altitude: 12,
      },
      400,
    )
    await new Promise((resolve) => setTimeout(resolve, 400))
    setCurrentPlanet(planetName)
    const targetAltitude =
      PLANETS_DATA[planetName].scale === 5 ? 8 : 2.5
    globe.pointOfView({ lat: 0, lng: 0, altitude: targetAltitude }, 1000)
  }

  return (
    <div
      className="relative h-full w-full"
      onPointerDown={(event) => {
        pointerDownCoords.current = { x: event.clientX, y: event.clientY }
      }}
    >
      <Globe
        ref={globeRef}
        width={viewport.width}
        height={viewport.height}
        globeImageUrl={(() => {
          const planetData =
            PLANETS_DATA[currentPlanet as keyof typeof PLANETS_DATA]
          return 'realTexture' in planetData
            ? planetData.realTexture
            : planetData.texture
        })()}
        backgroundColor="rgba(0,0,0,0)"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        onZoom={(pov) => setShowPlanetMenu(pov.altitude > 5.0)}
        polygonsData={currentPlanet === 'Earth' ? countries.features : []}
        polygonAltitude={0.01}
        polygonCapColor={() => 'rgba(255, 255, 255, 0.0)'}
        polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
        polygonStrokeColor={() => '#111'}
        onPolygonClick={(polygon, event) => {
          const distance = Math.hypot(
            event.clientX - pointerDownCoords.current.x,
            event.clientY - pointerDownCoords.current.y,
          )
          if (distance > 5) {
            return
          }
          setViewMode('2D')
          setSelectedRegionData(
            (polygon as CountryFeature).properties ?? null,
          )
        }}
      />

      <AnimatePresence>
        {showPlanetMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, y: -20, x: '-50%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute top-1/4 left-1/2 z-20 w-[min(92vw,32rem)] rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-white shadow-2xl backdrop-blur-md"
          >
          <p className="mb-3 text-center text-sm font-medium text-slate-200">
            Solar System
          </p>
          <div className="grid grid-cols-3 gap-2">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GlobeView
