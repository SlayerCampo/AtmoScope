import { ComposableMap, Geography, Geographies, ZoomableGroup } from 'react-simple-maps'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

const GEO_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

function FlatMapView() {
  const setViewMode = useAppStore((state) => state.setViewMode)
  const [zoomHintOpacity, setZoomHintOpacity] = useState(0)

  return (
    <div className="relative h-full w-full bg-slate-950">
      <button
        type="button"
        onClick={() => setViewMode('3D')}
        className="absolute top-6 left-6 z-10 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 shadow-lg backdrop-blur-md transition hover:bg-white/10"
      >
        Back to Orbit (3D)
      </button>

      <ComposableMap
        projection="geoMercator"
        className="h-full w-full"
        projectionConfig={{ scale: 150 }}
      >
        <ZoomableGroup
          minZoom={0.5}
          maxZoom={10}
          translateExtent={[
            [0, -200],
            [800, 600],
          ]}
          onMove={(position) => {
            setZoomHintOpacity(position.zoom < 0.8 ? 1 : 0)
            if (position.zoom < 0.55) {
              setViewMode('3D')
            }
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geography) => (
                <Geography
                  key={geography.rsmKey}
                  geography={geography}
                  fill="#334155"
                  stroke="#64748b"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#38bdf8', outline: 'none' },
                    pressed: { fill: '#22d3ee', outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <div
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-200 backdrop-blur-md transition-opacity"
        style={{ opacity: zoomHintOpacity }}
      >
        Keep scrolling out to return to orbit...
      </div>
    </div>
  )
}

export default FlatMapView
