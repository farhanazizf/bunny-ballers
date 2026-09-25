import { asset } from '../../lib/asset'

export function HeroArt() {
  return (
    <div className="absolute inset-0 bg-bunny-ink" aria-hidden>
      <img
        src={asset('gallery/3.png')}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_28%] opacity-55"
        width={1560}
        height={1494}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bunny-ink via-bunny-ink/80 to-bunny-ink/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-bunny-ink via-transparent to-bunny-ink/50" />
      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M0 560 C 380 300, 1060 300, 1440 560" fill="none" stroke="#D96A32" strokeWidth="2" />
      </svg>
    </div>
  )
}
