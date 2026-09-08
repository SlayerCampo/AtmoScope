import { AnimatePresence, motion } from 'framer-motion'
import { latLngBounds, type LatLngBounds, type Layer, type PathOptions } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { GeoJsonObject } from 'geojson'
import { useAppStore } from '../store/useAppStore'

const GEO_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

type RegionProperties = {
  ADMIN?: string
  CONTINENT?: string
  [key: string]: unknown
}

type FeatureLayer = Layer & {
  feature?: {
    properties?: RegionProperties
  }
  getBounds?: () => LatLngBounds
  eachLayer?: (callback: (layer: Layer) => void) => void
}

type MapControllerProps = {
  onZoomOut: (isZoomedOut: boolean) => void
}

function MapController({ onZoomOut }: MapControllerProps) {
  useMapEvents({
    zoom: (event) => {
      onZoomOut(event.target.getZoom() <= 2.5)
    },
  })

  return null
}

function MapEffects({
  geoData,
  selectedRegionData,
  selectionLevel,
}: {
  geoData: GeoJsonObject | null
  selectedRegionData: RegionProperties | null
  selectionLevel: 'GLOBAL' | 'CONTINENT' | 'COUNTRY'
}) {
  const map = useMap()

  useEffect(() => {
    if (!geoData || !selectedRegionData) {
      return
    }

    const targetAdmin = selectedRegionData.ADMIN
    const targetContinent = selectedRegionData.CONTINENT
    const bounds = latLngBounds([])

    map.eachLayer((layer) => {
      const group = layer as FeatureLayer
      if (!group.eachLayer) {
        return
      }

      group.eachLayer((featureLayer) => {
        const countryLayer = featureLayer as FeatureLayer
        const properties = countryLayer.feature?.properties
        const isMatch =
          selectionLevel === 'COUNTRY'
            ? properties?.ADMIN === targetAdmin
            : properties?.CONTINENT === targetContinent

        if (isMatch && countryLayer.getBounds) {
          bounds.extend(countryLayer.getBounds())
        }
      })
    })

    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        duration: 1.5,
        padding: [50, 50],
      })
    }
  }, [geoData, map, selectedRegionData, selectionLevel])

  return null
}

function FlatMapView() {
  const setViewMode = useAppStore((state) => state.setViewMode)
  const selectedRegionData = useAppStore(
    (state) => state.selectedRegionData as RegionProperties | null,
  )
  const selectionLevel = useAppStore((state) => state.selectionLevel)
  const setSelectedRegionData = useAppStore(
    (state) => state.setSelectedRegionData,
  )
  const setSelectionLevel = useAppStore((state) => state.setSelectionLevel)
  const setSidePanelOpen = useAppStore((state) => state.setSidePanelOpen)
  const selectionLevelRef = useRef(selectionLevel)
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null)
  const [showExitButton, setShowExitButton] = useState(false)

  useEffect(() => {
    selectionLevelRef.current = selectionLevel
  }, [selectionLevel])

  useEffect(() => {
    fetch(GEO_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load map borders: ${response.status}`)
        }
        return response.json() as Promise<GeoJsonObject>
      })
      .then(setGeoData)
      .catch((error: unknown) => {
        console.error('Unable to load map borders', error)
      })
  }, [])

  return (
    <div className="relative h-full w-full bg-slate-950">
      <MapContainer
        center={[20, 0]}
        zoom={4}
        minZoom={1.5}
        maxZoom={12}
        zoomControl={false}
        attributionControl={false}
        className="relative z-10 h-screen w-full bg-slate-950"
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          keepBuffer={4}
        />
        {geoData && (
          <GeoJSON
            data={geoData}
            style={(feature) => {
              const properties = feature?.properties as RegionProperties | undefined
              const isSelectedCountry =
                properties?.ADMIN === selectedRegionData?.ADMIN
              const isSelectedContinent =
                properties?.CONTINENT === selectedRegionData?.CONTINENT &&
                selectionLevel === 'CONTINENT'

              if (isSelectedCountry || isSelectedContinent) {
                return {
                  color: '#00ffff',
                  weight: 2,
                  fillColor: 'transparent',
                  fillOpacity: 0,
                  shadowBlur: 10,
                  shadowColor: '#00ffff',
                } as PathOptions
              }

              return {
                color: 'rgba(255,255,255,0.1)',
                weight: 1,
                fillColor: 'transparent',
              }
            }}
            onEachFeature={(feature, layer) => {
              layer.on('click', () => {
                const nextLevel =
                  selectionLevelRef.current === 'CONTINENT'
                    ? 'COUNTRY'
                    : 'CONTINENT'
                setSelectedRegionData(feature.properties ?? null)
                setSelectionLevel(nextLevel)
                setSidePanelOpen(true)
              })
              layer.on('dblclick', () => {
                setSelectedRegionData(feature.properties ?? null)
                setSelectionLevel('COUNTRY')
                setSidePanelOpen(true)
              })
            }}
          />
        )}
        <MapController onZoomOut={setShowExitButton} />
        <MapEffects
          geoData={geoData}
          selectedRegionData={selectedRegionData}
          selectionLevel={selectionLevel}
        />
      </MapContainer>

      <button
        type="button"
        onClick={() => setViewMode('3D')}
        className="absolute top-6 left-6 z-20 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 shadow-lg backdrop-blur-md transition hover:bg-white/10"
      >
        Back to Orbit (3D)
      </button>

      <AnimatePresence>
        {showExitButton && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 16, x: '-50%' }}
            onClick={() => setViewMode('3D')}
            className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-blue-400 bg-blue-600/80 px-8 py-3 font-bold text-white shadow-[0_0_30px_rgba(0,150,255,0.6)] backdrop-blur-lg transition-all hover:scale-105 hover:bg-blue-500/90"
          >
            Initiate Orbit Sequence (3D)
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FlatMapView
