import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { InstagramLogo, WhatsappLogo } from '@phosphor-icons/react'
import logo from '../../assets/logo/logo.png'
import { site } from '../../data/site'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import { cn } from '../../lib/cn'
import { buildWhatsAppUrl } from '../../lib/whatsapp'
import { Button } from '../ui/primitives'

const BASE_LINKS = ['about', 'programs', 'schedule', 'gallery', 'faq'] as const

export function Seo() {
  useEffect(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'SportsClub',
      name: site.name,
      sport: 'Basketball',
      telephone: `+${site.whatsapp.number}`,
      sameAs: [site.instagram],
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address,
        addressLocality: 'BSD, Tangerang Selatan',
        addressCountry: 'ID',
      },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '18:00', closes: '20:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '12:00' },
      ],
    }
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = 'bb-jsonld'
    el.text = JSON.stringify(data)
    document.getElementById('bb-jsonld')?.remove()
    document.head.appendChild(el)
    return () => el.remove()
  }, [])
  return null
}

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const lng = i18n.resolvedLanguage ?? 'id'
  return (
    <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-bunny-mute">
      <button
        type="button"
        className={cn('min-h-11 px-1', lng.startsWith('id') && 'text-bunny-chalk')}
        onClick={() => void i18n.changeLanguage('id')}
      >
        ID
      </button>
      <span className="text-bunny-steel">|</span>
      <button
        type="button"
        className={cn('min-h-11 px-1', lng.startsWith('en') && 'text-bunny-chalk')}
        onClick={() => void i18n.changeLanguage('en')}
      >
        EN
      </button>
    </div>
  )
}

export function Navbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const links = [...BASE_LINKS]
  const active = useScrollSpy([...links], 140)
  useLockBodyScroll(open)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    document.getElementById(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-nav)]">
      <nav
        className={cn(
          'flex w-full items-center justify-between border-b px-4 py-2.5 md:px-8',
          solid
            ? 'border-bunny-steel bg-bunny-ink/90 backdrop-blur-md'
            : 'border-transparent bg-gradient-to-b from-bunny-ink/80 to-transparent',
        )}
      >
        <a
          href="#hero"
          className="flex items-center gap-3"
          onClick={(e) => {
            e.preventDefault()
            go('hero')
          }}
        >
          <img src={logo} alt="Bunny Ballers" className="h-10 w-10 object-contain" width={40} height={40} />
          <span className="hidden font-medium text-bunny-chalk sm:block">
            {site.name}
          </span>
        </a>
        <div className="hidden items-center gap-6 lg:flex">
          {links.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              className={cn(
                'min-h-11 font-sans text-sm font-medium text-bunny-mute transition hover:text-bunny-chalk',
                active === id && 'text-bunny-chalk underline decoration-bunny-orange decoration-2 underline-offset-8',
              )}
            >
              {t(`nav.${id}`)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button className="hidden md:inline-flex" onClick={() => go('register')}>
            {t('nav.register')}
          </Button>
          <button
            type="button"
            className="min-h-11 min-w-11 lg:hidden"
            aria-label={t('nav.menu')}
            onClick={() => setOpen(true)}
          >
            <span className="block h-0.5 w-6 bg-bunny-chalk" />
            <span className="mt-1.5 block h-0.5 w-6 bg-bunny-chalk" />
          </button>
        </div>
      </nav>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bunny-ink px-6 py-10 lg:hidden">
          <button type="button" className="min-h-11 self-end text-bunny-chalk" onClick={() => setOpen(false)}>
            {t('nav.close')}
          </button>
          <div className="mt-12 flex flex-col gap-6">
            {links.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                className="text-left font-display text-4xl font-medium text-bunny-chalk"
              >
                {t(`nav.${id}`)}
              </button>
            ))}
            <Button onClick={() => go('register')}>{t('nav.register')}</Button>
          </div>
        </div>
      )}
    </header>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-bunny-steel px-6 pb-24 pt-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <img src={logo} alt="Bunny Ballers" className="h-16 w-16 rounded-lg object-contain" width={64} height={64} />
          <p className="mt-4 font-display text-2xl font-medium tracking-tight text-bunny-chalk">{site.name}</p>
          <p className="mt-2 max-w-sm font-medium text-bunny-mute">{t('footer.tagline')}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-bunny-mute">
          {BASE_LINKS.map((id) => (
            <a key={id} href={`#${id}`} className="hover:text-bunny-chalk">
              {t(`nav.${id}`)}
            </a>
          ))}
          <Link to="/privacy" className="hover:text-bunny-chalk">
            {t('legal.privacy')}
          </Link>
          <Link to="/terms" className="hover:text-bunny-chalk">
            {t('legal.terms')}
          </Link>
        </div>
        <div className="text-sm font-medium tabular-nums text-bunny-mute">
          <p>Jumat 18:00–20:00</p>
          <p>Sabtu 10:00–12:00</p>
          <p className="mt-3">{site.venue}</p>
          <div className="mt-5 flex gap-4">
            <a href={site.instagram} className="flex min-h-11 min-w-11 items-center" aria-label="Instagram">
              <InstagramLogo size={28} />
            </a>
            <a
              href={buildWhatsAppUrl(site.whatsapp.number, 'Halo Bunny Ballers')}
              className="flex min-h-11 min-w-11 items-center"
              aria-label={t('common.waLabel')}
            >
              <WhatsappLogo size={28} />
            </a>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-14 max-w-6xl text-sm text-bunny-mute">
        © {year} {site.name}. {t('footer.rights')} {t('footer.dataNote')}
      </p>
    </footer>
  )
}

export function FloatingWhatsApp() {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!show) return null
  return (
    <a
      href={buildWhatsAppUrl(site.whatsapp.number, 'Halo Bunny Ballers')}
      target="_blank"
      rel="noreferrer"
      aria-label={t('common.waLabel')}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-bunny-orange text-bunny-ink shadow-[0_10px_30px_-10px_rgba(217,106,50,0.8)] transition hover:translate-y-[-2px] active:scale-95"
    >
      <WhatsappLogo size={28} weight="fill" />
    </a>
  )
}

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bunny-ink px-6 text-center">
      <h1 className="font-display text-5xl font-medium tracking-tight text-bunny-chalk">{t('notFound.title')}</h1>
      <p className="mt-4 text-bunny-mute">{t('notFound.body')}</p>
      <Link to="/" className="mt-8">
        <Button>{t('notFound.cta')}</Button>
      </Link>
    </main>
  )
}

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const { t } = useTranslation()
  return (
    <main className="min-h-dvh bg-bunny-ink px-6 py-24 text-bunny-chalk">
      <div className="mx-auto max-w-prose">
        <Link to="/" className="text-sm font-semibold text-bunny-orange underline">
          {t('legal.back')}
        </Link>
        <h1 className="mt-10 font-display text-4xl font-medium tracking-tight">
          {t(kind === 'privacy' ? 'legal.privacyTitle' : 'legal.termsTitle')}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-bunny-mute">
          {t(kind === 'privacy' ? 'legal.privacyBody' : 'legal.termsBody')}
        </p>
      </div>
    </main>
  )
}
