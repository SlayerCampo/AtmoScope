import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import { useAppStore } from '../store/useAppStore'

function MapController() {
  const setViewMode = useAppStore((state) => state.setViewMode)

  useMapEvents({
    zoomend: (event) => {
      if (event.target.getZoom() < 3) {
        setViewMode('3D')
      }
    },
  })

  return null
}

function FlatMapView() {
  const setViewMode = useAppStore((state) => state.setViewMode)

  return (
    <div className="relative h-full w-full bg-slate-950">
      <MapContainer
        center={[20, 0]}
        zoom={4}
        minZoom={2.5}
        maxZoom={12}
        className="relative z-10 h-screen w-full"
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />
        <MapController />
      </MapContainer>

      <button
        type="button"
        onClick={() => setViewMode('3D')}
        className="absolute top-6 left-6 z-20 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 shadow-lg backdrop-blur-md transition hover:bg-white/10"
      >
        Back to Orbit (3D)
      </button>
    </div>
  )
}

export default FlatMapView
