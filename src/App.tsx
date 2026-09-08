import { Globe } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import GlobeView from './components/GlobeView'
import FlatMapView from './components/FlatMapView'
import { useAppStore } from './store/useAppStore'

function App() {
  const viewMode = useAppStore((state) => state.viewMode)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoaded(true), 2000)
    return () => clearTimeout(timeout)
  }, [])

  if (!isLoaded) {
    return (
      <main className="flex h-screen w-screen items-center justify-center bg-slate-950 text-cyan-300">
        <p className="animate-pulse text-sm font-medium tracking-[0.3em]">
          CALIBRATING ORBITAL SENSORS...
        </p>
      </main>
    )
  }

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
            {viewMode === '3D' ? (
              <motion.div
                className="h-full w-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.6, duration: 1.2 }}
              >
                <GlobeView />
              </motion.div>
            ) : (
              <FlatMapView />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <header className="absolute top-6 left-6 z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <Globe className="h-6 w-6 text-cyan-300" aria-hidden="true" />
        <h1 className="text-lg font-semibold tracking-wide">AtmoScope</h1>
      </header>

      <motion.div
        className="absolute top-6 right-0 bottom-24 z-10 w-80 cursor-pointer border-l border-blue-400 bg-blue-500/50 shadow-[-5px_0_15px_rgba(0,100,255,0.4)] transition-colors hover:bg-blue-400"
        variants={{
          open: { x: 0 },
          closed: { x: 'calc(100% - 16px)' },
        }}
        animate={isSidePanelOpen ? 'open' : 'closed'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={() => setIsSidePanelOpen((open) => !open)}
      >
        <aside
          className="flex h-full w-full flex-col rounded-l-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="text-sm font-medium text-slate-200">
            Region Climate Data
          </p>
        </aside>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-1/2 z-10 h-16 w-2/3 -translate-x-1/2 cursor-pointer border-t border-blue-400 bg-blue-500/50 shadow-[0_-5px_15px_rgba(0,100,255,0.4)] transition-colors hover:bg-blue-400"
        variants={{
          open: { y: 0 },
          closed: { y: 'calc(100% - 16px)' },
        }}
        animate={isTimelineOpen ? 'open' : 'closed'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={() => setIsTimelineOpen((open) => !open)}
      >
        <div
          className="flex h-full w-full items-center justify-center rounded-t-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="text-sm font-medium text-slate-200">Timeline Slider</p>
        </div>
      </motion.div>
    </main>
  )
}

export default App
