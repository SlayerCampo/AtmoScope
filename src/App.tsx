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
        className="fixed top-6 right-0 bottom-36 z-40 flex w-80 rounded-l-2xl border-y border-l border-white/20 bg-slate-900/80 backdrop-blur-md"
        initial={false}
        animate={{ x: isSidePanelOpen ? 0 : 'calc(100% - 32px)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <button
          type="button"
          aria-label={isSidePanelOpen ? 'Close climate data panel' : 'Open climate data panel'}
          className="flex h-full w-[32px] shrink-0 items-center justify-center border-r border-white/10 transition-colors hover:bg-white/5"
          onClick={() => setIsSidePanelOpen((open) => !open)}
        >
          <div className="h-12 w-1.5 rounded-full bg-white/30" />
        </button>
        <aside
          className="flex h-full flex-1 flex-col p-4"
        >
          <p className="text-sm font-medium text-slate-200">
            Region Climate Data
          </p>
        </aside>
      </motion.div>

      <motion.div
        className="fixed bottom-0 left-1/2 z-50 flex h-32 w-[calc(100%-22rem)] max-w-4xl -translate-x-1/2 flex-col rounded-t-2xl border-x border-t border-white/20 bg-slate-900/80 backdrop-blur-md"
        initial={false}
        animate={{
          x: '-50%',
          y: isTimelineOpen ? 0 : 'calc(100% - 32px)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div
          className="flex h-8 w-full shrink-0 cursor-pointer items-center justify-center transition-colors hover:bg-white/5"
          onClick={() => setIsTimelineOpen((open) => !open)}
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-white/30" />
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-sm font-medium text-slate-200">Timeline Slider</p>
        </div>
      </motion.div>
    </main>
  )
}

export default App
