import type { GeoJsonObject } from 'geojson'

export type RegionProperties = {
  ADMIN: string
  CONTINENT: string
  [key: string]: unknown
}

export type CountryFeature = {
  type: 'Feature'
  properties: RegionProperties
  geometry: unknown
}

export type CountryCollection = GeoJsonObject & {
  features: CountryFeature[]
}

const GEO_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

let cachedData: CountryCollection | null = null

export async function fetchCountriesData(): Promise<CountryCollection> {
  if (cachedData) return cachedData

  const res = await fetch(GEO_URL)
  if (!res.ok) throw new Error(`Failed to load country data: ${res.status}`)

  const data = (await res.json()) as CountryCollection

  // Fix continent mappings for better realism
  data.features.forEach((feature) => {
    const name = feature.properties.ADMIN
    
    // Transcontinental countries between Europe and Asia
    if (
      name === 'Russia' ||
      name === 'Turkey' ||
      name === 'Kazakhstan' ||
      name === 'Georgia' ||
      name === 'Azerbaijan' ||
      name === 'Armenia'
    ) {
      feature.properties.CONTINENT = 'Eurasia (Transcontinental)'
    }
    
    // Transcontinental between Africa and Asia
    if (name === 'Egypt') {
      feature.properties.CONTINENT = 'Africa / Asia (Transcontinental)'
    }

    // Central America
    const centralAmerica = [
      'Belize', 'Costa Rica', 'El Salvador', 'Guatemala', 
      'Honduras', 'Nicaragua', 'Panama'
    ]
    if (centralAmerica.includes(name)) {
      feature.properties.CONTINENT = 'Central America'
    }

    // Caribbean
    const caribbean = [
      'Cuba', 'Dominican Republic', 'Haiti', 'Jamaica', 
      'The Bahamas', 'Bahamas', 'Trinidad and Tobago', 'Puerto Rico'
    ]
    if (caribbean.includes(name)) {
      feature.properties.CONTINENT = 'Caribbean'
    }
  })

  cachedData = data
  return data
}
