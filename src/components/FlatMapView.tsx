import { ComposableMap, Geography, Geographies, ZoomableGroup } from 'react-simple-maps'
import { useAppStore } from '../store/useAppStore'

const GEO_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

function FlatMapView() {
  const setViewMode = useAppStore((state) => state.setViewMode)

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
        <ZoomableGroup>
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
    </div>
  )
}

export default FlatMapView
