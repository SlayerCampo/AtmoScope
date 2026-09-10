import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import * as THREE from 'three'
import { useAppStore } from '../store/useAppStore'
import { fetchCountriesData, type CountryCollection, type CountryFeature } from '../services/mapData'

const PLANETS_DATA = {
  Sun: {
    texture: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/sunmap.jpg',
    scale: 5,
    hasRings: false,
    info: 'Center of the solar system.',
  },
  Mercury: {
    texture: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/mercurymap.jpg',
    scale: 1,
    hasRings: false,
    info: 'No atmosphere. Temp: -173°C to 427°C',
  },
  Venus: {
    texture: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/venusmap.jpg',
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
    texture: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/marsmap1k.jpg',
    scale: 1,
    hasRings: false,
    info: 'Cold desert. Average Temp: -65°C',
  },
  Jupiter: {
    texture: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/jupitermap.jpg',
    scale: 2,
    hasRings: false,
    info: 'Gas giant. Cloud top Temp: -108°C',
  },
  Saturn: {
    texture: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnmap.jpg',
    scale: 1.8,
    hasRings: true,
    ringColor: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnringcolor.jpg',
    ringAlpha: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnringpattern.gif',
    info: 'Ringed gas giant. Temp: -139°C',
  },
  Uranus: {
    texture: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/uranusmap.jpg',
    scale: 1.5,
    hasRings: true,
    ringColor: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/uranusringcolour.jpg',
    ringAlpha: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/uranusringtrans.gif',
    info: 'Ice giant. Temp: -195°C',
  },
  Neptune: {
    texture: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/neptunemap.jpg',
    scale: 1.5,
    hasRings: false,
    info: 'Ice giant. High winds. Temp: -200°C',
  },
} as const

const transparentPolygonCap = () => 'rgba(255, 255, 255, 0.0)'
const polygonSide = () => 'rgba(0, 100, 0, 0.15)'
const polygonStroke = () => '#111'

function GlobeView() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const pointerDownCoords = useRef({ x: 0, y: 0 })
  const isMenuVisibleRef = useRef(false)
  const isTravelingRef = useRef(false)
  const currentPlanet = useAppStore((state) => state.currentPlanet)
  const setCurrentPlanet = useAppStore((state) => state.setCurrentPlanet)
  const setViewMode = useAppStore((state) => state.setViewMode)
  const setSelectedRegionData = useAppStore(
    (state) => state.setSelectedRegionData,
  )
  const setSelectionLevel = useAppStore((state) => state.setSelectionLevel)
  const [viewport, setViewport] = useState({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  })
  const [showPlanetMenu, setShowPlanetMenu] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)
  const [countries, setCountries] = useState<CountryCollection>({
    features: [],
  })

  useEffect(() => {
    fetchCountriesData()
      .then(setCountries)
      .catch((err) => console.error(err))
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
      ;(scene as any).environment = null
    }
    const globeMesh = scene
      ? (scene.children.find(
          (child) => child.type === 'Mesh' || child.name === 'globe',
        ) as THREE.Mesh | undefined)
      : undefined

    if (globeMesh) {
      const planetData = PLANETS_DATA[currentPlanet as keyof typeof PLANETS_DATA]
      
      // Update Scale
      globeMesh.scale.set(planetData.scale, planetData.scale, planetData.scale)

      // Manage Rings
      const existingRing = globeMesh.children.find((c) => c.name === 'planetRing')
      if (existingRing) {
        globeMesh.remove(existingRing)
        if (existingRing instanceof THREE.Mesh) {
          existingRing.geometry.dispose()
          if (existingRing.material instanceof THREE.Material) {
            existingRing.material.dispose()
          }
        }
      }

      if (planetData.hasRings && 'ringColor' in planetData) {
        const textureLoader = new THREE.TextureLoader()
        const ringTex = textureLoader.load((planetData as any).ringColor)
        const ringAlpha = textureLoader.load((planetData as any).ringAlpha)

        // The default Globe radius is 100.
        // We make the inner radius slightly larger than 100 to avoid clipping.
        const ringGeometry = new THREE.RingGeometry(115, 230, 64)

        // Fix UV mapping for RingGeometry so textures map radially
        const pos = ringGeometry.attributes.position
        const v3 = new THREE.Vector3()
        for (let i = 0; i < pos.count; i++) {
          v3.fromBufferAttribute(pos, i)
          ringGeometry.attributes.uv.setXY(i, v3.length() < 172 ? 0 : 1, 1) // Approximation mapping
        }

        const ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTex,
          alphaMap: ringAlpha,
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        })

        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial)
        ringMesh.name = 'planetRing'
        
        // Rotate to align with the equator (RingGeometry is drawn in XY plane by default)
        ringMesh.rotation.x = Math.PI / 2
        
        // Add a slight tilt to the ring based on the planet
        ringMesh.rotation.y = currentPlanet === 'Uranus' ? Math.PI / 2 : Math.PI / 12

        globeMesh.add(ringMesh)
      }
    }
  }, [currentPlanet])

  const handlePlanetTravel = async (
    planetName: keyof typeof PLANETS_DATA,
  ) => {
    const globe = globeRef.current
    if (!globe || planetName === currentPlanet || isTravelingRef.current) {
      return
    }

    isTravelingRef.current = true
    setShowPlanetMenu(false)

    const currentPov = globe.pointOfView()
    
    // 1. Aleja del planeta mirándolo
    globe.pointOfView({ altitude: 6 }, 500)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 2. Gira rápidamente y enfoca hacia el vacío espacial simulando la preparación para saltar
    globe.pointOfView(
      {
        lat: currentPov.lat + 60,
        lng: currentPov.lng + 180,
        altitude: 15,
      },
      600,
    )
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 3. Activa el destello "Warp"
    setIsFlashing(true)
    await new Promise((resolve) => setTimeout(resolve, 150)) // El pico del flash

    // 4. Cambia la textura, pon la cámara lejísimos (hyperspace exit)
    setCurrentPlanet(planetName)
    globe.pointOfView({ lat: 0, lng: 0, altitude: 30 }, 0)

    // 5. Apaga el destello gradualmente y acércate rápido al nuevo planeta
    setIsFlashing(false)
    const targetAltitude = PLANETS_DATA[planetName].scale === 5 ? 8 : 2.5
    
    await new Promise((resolve) => setTimeout(resolve, 50))
    globe.pointOfView({ lat: 0, lng: 0, altitude: targetAltitude }, 1200)

    await new Promise((resolve) => setTimeout(resolve, 1200))
    isTravelingRef.current = false
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
        globeImageUrl={PLANETS_DATA[currentPlanet as keyof typeof PLANETS_DATA].texture}
        backgroundColor="rgba(0,0,0,0)"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        onZoom={(pov) => {
          if (isTravelingRef.current) return
          const isFar = pov.altitude > 5.0
          if (isFar !== isMenuVisibleRef.current) {
            isMenuVisibleRef.current = isFar
            setShowPlanetMenu(isFar)
          }
        }}
        polygonsData={currentPlanet === 'Earth' ? countries.features : []}
        polygonAltitude={0.01}
        polygonCapColor={transparentPolygonCap}
        polygonSideColor={polygonSide}
        polygonStrokeColor={polygonStroke}
        onPolygonClick={(polygon, event) => {
          if (isTravelingRef.current) return
          const distance = Math.hypot(
            event.clientX - pointerDownCoords.current.x,
            event.clientY - pointerDownCoords.current.y,
          )
          if (distance > 5) {
            return
          }
          setViewMode('2D')
          setSelectionLevel('COUNTRY')
          setSelectedRegionData(
            (polygon as CountryFeature).properties ?? null,
          )
        }}
      />

      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeOut' } }}
            className="pointer-events-none absolute inset-0 z-30 bg-cyan-100 mix-blend-screen"
            style={{ boxShadow: 'inset 0 0 150px rgba(255,255,255,1)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPlanetMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, y: -20, x: '-50%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute top-1/4 left-1/2 z-20 w-[min(90vw,28rem)] rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 text-white shadow-[0_0_30px_rgba(34,211,238,0.1)] backdrop-blur-md"
          >
          <p className="mb-4 text-center bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-xs font-bold uppercase tracking-widest text-transparent">
            Orbital Navigation
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(PLANETS_DATA) as Array<keyof typeof PLANETS_DATA>).map(
              (planet) => (
                <button
                  key={planet}
                  type="button"
                  onClick={() => handlePlanetTravel(planet)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-300 ${
                    currentPlanet === planet
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'border-transparent bg-slate-800/50 text-slate-400 hover:border-cyan-500/30 hover:bg-slate-700/50 hover:text-cyan-200'
                  }`}
                >
                  {planet}
                </button>
              ),
            )}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            {PLANETS_DATA[currentPlanet as keyof typeof PLANETS_DATA]?.info}
          </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GlobeView
