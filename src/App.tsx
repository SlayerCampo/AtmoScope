import { Globe } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import GlobeView from './components/GlobeView'
import FlatMapView from './components/FlatMapView'
import { useAppStore } from './store/useAppStore'

function App() {
  const viewMode = useAppStore((state) => state.viewMode)

  return (
    <main className="relative flex h-screen w-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewMode}
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {viewMode === '3D' ? <GlobeView /> : <FlatMapView />}
          </motion.div>
        </AnimatePresence>
      </div>

      <header className="absolute top-6 left-6 z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <Globe className="h-6 w-6 text-cyan-300" aria-hidden="true" />
        <h1 className="text-lg font-semibold tracking-wide">AtmoScope</h1>
      </header>

      <aside className="absolute top-6 right-6 bottom-24 z-10 flex w-80 flex-col rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <p className="text-sm font-medium text-slate-200">Region Climate Data</p>
      </aside>

      <div className="absolute bottom-6 left-1/2 z-10 flex h-16 w-2/3 -translate-x-1/2 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        <p className="text-sm font-medium text-slate-200">Timeline Slider</p>
      </div>
    </main>
  )
}

export default App
