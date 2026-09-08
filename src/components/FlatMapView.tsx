import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GeoJSON, MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import type { GeoJsonObject } from 'geojson'
import { useAppStore } from '../store/useAppStore'

const GEO_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

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

function FlatMapView() {
  const setViewMode = useAppStore((state) => state.setViewMode)
  const setSelectedRegionData = useAppStore(
    (state) => state.setSelectedRegionData,
  )
  const setSidePanelOpen = useAppStore((state) => state.setSidePanelOpen)
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null)
  const [showExitButton, setShowExitButton] = useState(false)

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
        className="relative z-10 h-screen w-full"
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
      >
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        {geoData && (
          <GeoJSON
            data={geoData}
            style={() => ({
              color: 'rgba(255,255,255,0.1)',
              weight: 1,
              fillColor: 'transparent',
            })}
            onEachFeature={(feature, layer) => {
              layer.on('click', () => {
                setSelectedRegionData(feature.properties ?? null)
                setSidePanelOpen(true)
              })
            }}
          />
        )}
        <MapController onZoomOut={setShowExitButton} />
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
