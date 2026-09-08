import { useEffect, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'

function GlobeView() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [viewport, setViewport] = useState({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  })

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
    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.5
    }
  }, [])

  return (
    <Globe
      ref={globeRef}
      width={viewport.width}
      height={viewport.height}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      backgroundColor="rgba(0,0,0,0)"
    />
  )
}

export default GlobeView
