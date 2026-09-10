import { Radar } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import GlobeView from './components/GlobeView'
import FlatMapView from './components/FlatMapView'
import { useAppStore } from './store/useAppStore'

function App() {
  const viewMode = useAppStore((state) => state.viewMode)
  const isSidePanelOpen = useAppStore((state) => state.isSidePanelOpen)
  const setSidePanelOpen = useAppStore((state) => state.setSidePanelOpen)
  const [isLoaded, setIsLoaded] = useState(false)
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

      <header className="absolute top-6 left-6 z-10 flex items-center gap-2 rounded-full border border-cyan-500/20 bg-slate-900/80 px-4 py-2 shadow-[0_0_20px_rgba(34,211,238,0.1)] backdrop-blur-md">
        <Radar className="h-4 w-4 text-cyan-400" aria-hidden="true" />
        <h1 className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-xs font-bold uppercase tracking-[0.2em] text-transparent">
          AtmoScope
        </h1>
      </header>

      <motion.div
        className="fixed top-6 right-0 bottom-36 z-40 flex w-72 rounded-l-2xl border-y border-l border-cyan-500/20 bg-slate-900/80 shadow-[0_0_20px_rgba(34,211,238,0.05)] backdrop-blur-md"
        initial={false}
        animate={{ x: isSidePanelOpen ? 0 : 'calc(100% - 32px)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <button
          type="button"
          aria-label={isSidePanelOpen ? 'Close climate data panel' : 'Open climate data panel'}
          className="flex h-full w-[32px] shrink-0 items-center justify-center border-r border-cyan-500/20 transition-colors hover:bg-cyan-500/10"
          onClick={() => setSidePanelOpen(!isSidePanelOpen)}
        >
          <div className="h-12 w-1.5 rounded-full bg-cyan-500/40" />
        </button>
        <aside
          className="flex h-full flex-1 flex-col overflow-y-auto p-4"
        >
          <p className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-xs font-bold uppercase tracking-widest text-transparent">
            Region Data
          </p>
          <div className="mt-4 flex-1 text-sm text-slate-300">
            <p className="text-slate-500 italic">No data selected...</p>
          </div>
        </aside>
      </motion.div>

      <motion.div
        className="fixed bottom-0 left-1/2 z-50 flex h-24 w-[calc(100%-24rem)] max-w-3xl -translate-x-1/2 flex-col rounded-t-2xl border-x border-t border-cyan-500/20 bg-slate-900/80 shadow-[0_-5px_20px_rgba(34,211,238,0.05)] backdrop-blur-md"
        initial={false}
        animate={{
          x: '-50%',
          y: isTimelineOpen ? 0 : 'calc(100% - 24px)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div
          className="flex h-6 w-full shrink-0 cursor-pointer items-center justify-center transition-colors hover:bg-cyan-500/10"
          onClick={() => setIsTimelineOpen((open) => !open)}
        >
          <div className="mx-auto h-1 w-12 rounded-full bg-cyan-500/40" />
        </div>
        <div className="flex flex-1 items-center justify-center p-2">
          <p className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-xs font-bold uppercase tracking-widest text-transparent">
            Timeline Slider
          </p>
        </div>
      </motion.div>
    </main>
  )
}

export default App
