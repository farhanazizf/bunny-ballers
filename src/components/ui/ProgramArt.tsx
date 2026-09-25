import { asset } from '../../lib/asset'

type ProgramId = 'mini' | 'junior' | 'senior'

const photos: Record<ProgramId, { src: string; w: number; h: number }> = {
  mini: { src: asset('gallery/6.png'), w: 1578, h: 1188 },
  junior: { src: asset('gallery/4.png'), w: 876, h: 980 },
  senior: { src: asset('gallery/3.png'), w: 1560, h: 1494 },
}

export function ProgramArt({ id }: { id: ProgramId }) {
  const photo = photos[id]
  return (
    <div className="absolute inset-0 bg-bunny-ink" aria-hidden>
      <img
        src={photo.src}
        alt=""
        width={photo.w}
        height={photo.h}
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bunny-ink via-bunny-ink/55 to-bunny-ink/20" />
      <CourtLines />
    </div>
  )
}

function CourtLines() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.14]" viewBox="0 0 400 540" preserveAspectRatio="xMidYMid slice">
      <rect x="24" y="24" width="352" height="492" fill="none" stroke="#F3EEE8" strokeWidth="2" />
      <circle cx="200" cy="270" r="72" fill="none" stroke="#D96A32" strokeWidth="2" />
      <line x1="24" y1="270" x2="376" y2="270" stroke="#F3EEE8" strokeWidth="1.5" />
      <path d="M120 24 V120 A80 80 0 0 0 280 120 V24" fill="none" stroke="#F3EEE8" strokeWidth="2" />
    </svg>
  )
}
