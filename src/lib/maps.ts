import { site } from '../data/site'

export function mapsEmbedUrl(): string | null {
  const fromEnv = import.meta.env.VITE_MAPS_EMBED_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.trim()
  if (!site.mapsEmbed) return null
  return site.mapsEmbed
}
