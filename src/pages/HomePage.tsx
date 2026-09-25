import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MapPin, Sneaker, UsersThree } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo/logo.png'
import { coaches } from '../data/coaches'
import { faqIds } from '../data/faq'
import { gallery } from '../data/gallery'
import { programs } from '../data/programs'
import { schedule } from '../data/schedule'
import { site } from '../data/site'
import { testimonials } from '../data/testimonials'
import { useRegisterIntent } from '../context/IntentContext'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useOnceReveal } from '../hooks/useOnceReveal'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { mapsEmbedUrl } from '../lib/maps'
import { trialSchema, type TrialForm } from '../lib/schema'
import { buildWhatsAppUrl, formatTrialMessage } from '../lib/whatsapp'
import { HeroArt } from '../components/ui/HeroArt'
import { ProgramArt } from '../components/ui/ProgramArt'
import { Button, Lightbox } from '../components/ui/primitives'
import { asset } from '../lib/asset'
import { cn } from '../lib/cn'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function SplitWords({ text }: { text: string }) {
  return text.split(' ').map((word, i) => (
    <span key={`${word}-${i}`} data-reveal className="inline-block pr-[0.28em]">
      {word}
    </span>
  ))
}

export function HomePage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden bg-bunny-ink text-bunny-chalk">
      <Hero />
      <About />
      <Marquee />
      <Programs />
      <Schedule />
      <Desire />
      <Gallery />
      {testimonials.length > 0 ? <Testimonials /> : null}
      {coaches.length > 0 ? <Coaches /> : null}
      <Faq />
      <Register />
    </main>
  )
}

function Hero() {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const root = useRef<HTMLElement>(null)
  const title = t('hero.title')

  useGSAP(
    () => {
      if (reduced || !root.current) return
      const words = root.current.querySelectorAll('.hero-word')
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.fromTo(words, { opacity: 0.08, y: 28 }, { opacity: 1, y: 0, stagger: 0.09, duration: 0.7 })
      tl.fromTo('.hero-sub', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35')
      tl.fromTo('.hero-cta', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 }, '-=0.25')
      tl.fromTo('.hero-mascot', { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.85 }, '-=0.45')
      tl.to('.hero-mascot', { y: -10, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      gsap.to('.hero-art-layer', {
        yPercent: 16,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    },
    { scope: root, dependencies: [reduced, title] },
  )

  return (
    <section id="hero" ref={root} className="relative min-h-dvh overflow-hidden">
      <HeroArt />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col justify-end px-6 pb-28 pt-36 md:flex-row md:items-end md:justify-between md:pb-32">
        <div className="max-w-5xl md:w-3/5">
          <h1
            className="font-display font-medium leading-[0.92] tracking-[-0.04em] text-bunny-chalk"
            style={{ fontSize: 'clamp(3rem, 5vw, 5.5rem)' }}
          >
            {title.split(' ').map((word, i) => (
              <span key={`${word}-${i}`} className="hero-word inline-block pr-[0.28em]">
                {word}
              </span>
            ))}
          </h1>
          <p className="hero-sub mt-8 max-w-[65ch] font-sans text-base font-medium leading-relaxed text-bunny-mute md:text-lg">
            {t('hero.subtitle')}
          </p>
          <div className="hero-cta mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('hero.ctaPrimary')}
            </Button>
            <button
              type="button"
              className="min-h-11 text-sm font-semibold text-bunny-chalk underline decoration-bunny-orange decoration-2 underline-offset-8 transition hover:text-bunny-orange"
              onClick={() => document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.ctaSecondary')}
            </button>
          </div>
        </div>
        <img
          src={logo}
          alt="Maskot Bunny Ballers"
          className="hero-mascot pointer-events-none mt-10 w-44 origin-bottom-right drop-shadow-[0_18px_32px_rgba(0,0,0,0.45)] md:absolute md:-bottom-4 md:-right-2 md:w-[22rem] lg:w-[26rem]"
          width={480}
          height={480}
        />
      </div>
    </section>
  )
}

function About() {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const title = t('about.title')
  useOnceReveal(ref, reduced, [title])
  const values = ['fundamentals', 'family', 'ready'] as const
  return (
    <section id="about" ref={ref} className="px-6 pt-32 pb-40 md:pt-48 md:pb-56">
      <div className="mx-auto grid max-w-6xl grid-flow-dense grid-cols-12 gap-4">
        <div className="col-span-12 flex flex-col justify-between rounded-[1.75rem] bg-bunny-coal p-8 md:p-12 lg:col-span-8 lg:row-span-2">
          <h2 className="max-w-[12ch] font-display text-4xl font-medium leading-[0.95] tracking-[-0.03em] md:text-6xl">
            <SplitWords text={title} />
          </h2>
          <p data-reveal className="mt-8 max-w-[65ch] text-base font-medium leading-relaxed text-bunny-mute md:text-lg">
            {t('about.body1')}
          </p>
          <div className="mt-10 space-y-8 border-t border-bunny-steel pt-8">
            {values.map((key) => (
              <div key={key} data-reveal className="max-w-xl">
                <p className="font-sans text-base italic font-medium text-bunny-orange">{t(`about.values.${key}.title`)}</p>
                <p className="mt-2 text-sm leading-relaxed text-bunny-mute">{t(`about.values.${key}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
        <div data-reveal className="col-span-12 -mt-2 overflow-hidden rounded-[1.75rem] lg:col-span-4 lg:row-span-2 lg:-mt-8">
          <div className="group h-full min-h-[320px] overflow-hidden">
            <img
              src={asset('gallery/5.png')}
              alt="Huddle tim putri Bunny Ballers"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              width={880}
              height={854}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const { t } = useTranslation()
  const items = [t('marquee.ages'), t('marquee.gender'), t('marquee.city'), t('marquee.trial'), t('marquee.venue')]
  const row = [...items, ...items, ...items]
  return (
    <div className="border-y border-bunny-steel bg-bunny-coal py-5">
      <div className="flex overflow-hidden">
        <div className="flex animate-marquee gap-12 whitespace-nowrap px-8 font-display text-xl font-medium tracking-[0.18em] text-bunny-chalk">
          {row.map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center gap-3">
              <Sneaker size={22} className="text-bunny-orange" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Programs() {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const title = t('programs.title')
  useOnceReveal(ref, reduced, [title])
  const { setIntent } = useRegisterIntent()
  const [active, setActive] = useState<(typeof programs)[number]['id']>('junior')

  const choose = (id: (typeof programs)[number]['id']) => {
    setIntent({ programId: id })
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="programs" ref={ref} className="px-6 pt-32 pb-40 md:pt-48 md:pb-56">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-[14ch] font-display text-4xl font-medium leading-[0.95] tracking-[-0.03em] md:text-6xl">
          <SplitWords text={title} />
        </h2>
        <p data-reveal className="mt-6 max-w-xl text-bunny-mute">
          {t('programs.subtitle')}
        </p>
        <div data-reveal className="mt-16 hidden h-[540px] gap-2 md:flex">
          {programs.map((p) => {
            const open = active === p.id
            return (
              <div
                key={p.id}
                onMouseEnter={() => setActive(p.id)}
                onFocus={() => setActive(p.id)}
                className={cn(
                  'relative overflow-hidden rounded-xl transition-[flex] duration-700 ease-out',
                  open ? 'flex-[4.2]' : 'flex-[0.85] min-w-[4.75rem] cursor-pointer',
                )}
              >
                <ProgramArt id={p.id} />
                {open ? (
                  <div className="animate-fade-up relative flex h-full flex-col justify-end p-8">
                    <p className="text-sm font-medium text-bunny-orange">
                      {t(`programs.${p.id}.ages`)} · {t('programs.gender')}
                    </p>
                    <h3 className="font-display text-3xl font-medium tracking-tight">{t(`programs.${p.id}.name`)}</h3>
                    <ul className="mt-6 max-w-sm space-y-2 text-bunny-mute">
                      {[0, 1, 2, 3].map((i) => (
                        <li key={i}>{t(`programs.${p.id}.points.${i}`)}</li>
                      ))}
                    </ul>
                    <Button type="button" className="mt-8 self-start" onClick={() => choose(p.id)}>
                      {t('programs.cta')}
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="absolute inset-0 flex items-center justify-center"
                    onClick={() => setActive(p.id)}
                  >
                    <span className="font-display text-xl font-medium tracking-wide [writing-mode:vertical-rl] rotate-180">
                      {t(`programs.${p.id}.name`)}
                    </span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-10 space-y-3 md:hidden">
          {programs.map((p) => {
            const open = active === p.id
            return (
              <div
                key={p.id}
                data-reveal
                className="relative overflow-hidden rounded-xl bg-bunny-coal transition-transform duration-200 active:scale-[0.985]"
              >
                <button type="button" className="w-full text-left" onClick={() => setActive(p.id)}>
                  <div className={cn('relative overflow-hidden transition-[height] duration-500 ease-out', open ? 'h-40' : 'h-24')}>
                    <ProgramArt id={p.id} />
                  </div>
                  <div className="flex items-end justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm text-bunny-orange">{t(`programs.${p.id}.ages`)}</p>
                      <h3 className="font-display text-2xl font-medium">{t(`programs.${p.id}.name`)}</h3>
                    </div>
                    <span
                      className={cn(
                        'mb-1 block h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-bunny-orange transition-transform duration-300',
                        open ? '-translate-y-0.5 rotate-[225deg]' : '',
                      )}
                    />
                  </div>
                </button>
                <div className={cn('grid transition-[grid-template-rows] duration-500 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-6">
                      <ul className="space-y-2 text-bunny-mute">
                        {[0, 1, 2, 3].map((i) => (
                          <li key={i}>{t(`programs.${p.id}.points.${i}`)}</li>
                        ))}
                      </ul>
                      <Button className="mt-5" onClick={() => choose(p.id)}>
                        {t('programs.cta')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Schedule() {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const title = t('schedule.title')
  useOnceReveal(ref, reduced, [title])
  const embed = mapsEmbedUrl()
  return (
    <section id="schedule" ref={ref} className="px-6 pt-32 pb-40 md:pt-48 md:pb-56">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <div>
          <h2 className="max-w-[12ch] font-display text-4xl font-medium leading-[0.95] tracking-[-0.03em] md:text-6xl">
            <SplitWords text={title} />
          </h2>
          <div className="mt-10 divide-y divide-bunny-steel border-y border-bunny-steel">
            {schedule.map((s) => (
              <div key={s.id} data-reveal className="flex items-end justify-between gap-4 py-6">
                <div>
                  <p className="font-sans text-sm italic font-medium text-bunny-orange">{t(`schedule.${s.dayId}`)}</p>
                  <p className="mt-2 text-bunny-mute">
                    {s.ageRange} · {s.gender}
                  </p>
                </div>
                <p className="font-display text-4xl font-medium tabular-nums tracking-tight md:text-5xl">
                  {s.start}
                  <span className="mx-2 text-lg text-bunny-mute">–</span>
                  {s.end}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-bunny-mute">{t('schedule.note')}</p>
        </div>
        <div data-reveal className="rounded-2xl bg-bunny-coal p-6 md:p-8">
          <p className="font-display text-2xl font-medium tracking-tight">{t('schedule.locationTitle')}</p>
          <p className="mt-4 flex items-start gap-2 text-bunny-mute">
            <MapPin className="mt-1 shrink-0 text-bunny-orange" />
            <span>
              {site.venue}
              <br />
              {site.address}
            </span>
          </p>
          {embed ? (
            <iframe title={site.venue} src={embed} className="mt-6 h-64 w-full rounded-2xl border-0" loading="lazy" />
          ) : null}
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex min-h-11 items-center text-bunny-orange underline"
          >
            {t('schedule.directions')}
          </a>
        </div>
      </div>
    </section>
  )
}

function Desire() {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const ref = useRef<HTMLParagraphElement>(null)
  const bgRef = useRef<HTMLImageElement>(null)
  const text = t('desire.text')
  const words = useMemo(() => text.split(' '), [text])

  useGSAP(
    () => {
      if (reduced || !ref.current) return
      const spans = ref.current.querySelectorAll('span')
      gsap.fromTo(
        spans,
        { opacity: 0.12, y: 12 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 82%',
            end: 'bottom 35%',
            scrub: true,
          },
        },
      )
      if (bgRef.current && sectionRef.current) {
        gsap.fromTo(
          bgRef.current,
          { scale: 1.16 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }
    },
    { dependencies: [reduced, text] },
  )

  return (
    <section ref={sectionRef} className="relative overflow-hidden px-6 pt-36 pb-44 md:pt-52 md:pb-60">
      <img
        ref={bgRef}
        src={asset('gallery/6.png')}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        width={1578}
        height={1188}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bunny-ink via-bunny-ink/70 to-bunny-ink" />
      <p
        ref={ref}
        className="relative mx-auto max-w-[22ch] text-left font-display text-3xl font-medium leading-[1.15] tracking-[-0.03em] md:text-5xl"
      >
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className="inline-block pr-[0.3em]">
            {w}
          </span>
        ))}
      </p>
    </section>
  )
}

const galleryFrames = [
  'col-span-2 aspect-[16/10] rounded-sm md:col-span-4 md:row-span-2 md:aspect-auto md:min-h-[22rem]',
  'aspect-[4/5] rounded-2xl md:col-span-2 md:min-h-[22rem]',
  'aspect-[5/4] rounded-md md:col-span-3',
  'aspect-[4/3] rounded-[1.25rem] md:col-span-3',
  'aspect-square rounded-sm md:col-span-2',
  'aspect-[16/10] rounded-xl md:col-span-4',
]

function Gallery() {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const title = t('gallery.title')
  useOnceReveal(ref, reduced, [title])
  const [index, setIndex] = useState<number | null>(null)
  useLockBodyScroll(index !== null)

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIndex(null)
      if (e.key === 'ArrowRight') setIndex((i) => (i === null ? 0 : (i + 1) % gallery.length))
      if (e.key === 'ArrowLeft') setIndex((i) => (i === null ? 0 : (i - 1 + gallery.length) % gallery.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index])

  return (
    <section id="gallery" ref={ref} className="relative px-6 pt-32 pb-40 md:pt-48 md:pb-56">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="font-display text-4xl font-medium tracking-[-0.03em] md:text-6xl">
            <SplitWords text={title} />
          </h2>
          <p data-reveal className="mt-6 max-w-[65ch] text-bunny-mute">
            {t('gallery.subtitle')}
          </p>
          <a href={site.instagram} data-reveal className="mt-6 inline-flex min-h-11 items-center text-bunny-orange underline">
            {t('gallery.cta')}
          </a>
        </div>
        <div className="-mx-6 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-3 md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
          {gallery.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              data-reveal
              className={cn(
                'group shrink-0 snap-center overflow-hidden transition-transform duration-200 active:scale-[0.98]',
                'w-[78vw] aspect-[4/5] rounded-xl md:w-auto md:snap-none',
                galleryFrames[i] ?? 'rounded-lg',
              )}
              onClick={() => setIndex(i)}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.w}
                height={photo.h}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>
      {index !== null && (
        <Lightbox
          src={gallery[index].src}
          alt={gallery[index].alt}
          onClose={() => setIndex(null)}
          onPrev={() => setIndex((i) => (i === null ? 0 : (i - 1 + gallery.length) % gallery.length))}
          onNext={() => setIndex((i) => (i === null ? 0 : (i + 1) % gallery.length))}
        />
      )}
    </section>
  )
}

function Testimonials() {
  const item = testimonials[0]
  if (!item) return null
  return (
    <section className="px-6 py-32">
      <blockquote className="mx-auto max-w-3xl font-display text-3xl font-medium leading-snug tracking-tight">{item.quote}</blockquote>
      <p className="mt-6 text-center text-bunny-mute">{item.name}</p>
    </section>
  )
}

function Coaches() {
  if (!coaches.length) return null
  return (
    <section id="coaches" className="px-6 py-32">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {coaches.map((c) => (
          <article key={c.id} className="rounded-2xl bg-bunny-coal p-6">
            <h3 className="font-display text-2xl font-medium">{c.name}</h3>
            <p className="text-bunny-orange">{c.role}</p>
            <p className="mt-3 text-bunny-mute">{c.bio}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Faq() {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const title = t('faq.title')
  useOnceReveal(ref, reduced, [title])
  return (
    <section id="faq" ref={ref} className="px-6 pt-32 pb-40 md:pt-48 md:pb-56">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-[16ch] font-display text-4xl font-medium tracking-[-0.03em] md:text-6xl">
          <SplitWords text={title} />
        </h2>
        <dl className="mt-16 grid gap-x-16 gap-y-12 md:grid-cols-2">
          {faqIds.map((id) => (
            <div key={id} data-reveal className="max-w-prose">
              <dt className="font-sans text-lg font-semibold leading-snug">{t(`faq.items.${id}.q`)}</dt>
              <dd className="mt-3 text-base leading-relaxed text-bunny-mute">{t(`faq.items.${id}.a`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Register() {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const title = t('register.title')
  useOnceReveal(ref, reduced, [title])
  const { intent } = useRegisterIntent()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TrialForm>({
    resolver: zodResolver(trialSchema),
    defaultValues: {
      session: 'fri',
      experience: 'none',
      gender: 'PA',
      programId: intent.programId,
      notes: '',
    },
  })

  useEffect(() => {
    if (intent.programId) setValue('programId', intent.programId)
    if (intent.session) setValue('session', intent.session)
  }, [intent, setValue])

  const onSubmit = (data: TrialForm) => {
    const genderLabel = t(`register.gender.${data.gender}`)
    const sessionLabel = `${t(`schedule.${data.session === 'fri' ? 'friday' : 'saturday'}`)} ${
      data.session === 'fri' ? '18:00' : '10:00'
    }`
    const exp = t(`register.experience.${data.experience}`)
    const message = formatTrialMessage(t, {
      childName: data.childName,
      age: data.age,
      gender: genderLabel,
      parentName: data.parentName,
      whatsapp: data.whatsapp,
      session: sessionLabel,
      experience: exp,
      notes: data.notes,
    })
    window.open(buildWhatsAppUrl(site.whatsapp.number, message), '_blank', 'noopener,noreferrer')
  }

  const fieldClass =
    'mt-2 w-full rounded-lg border border-bunny-steel bg-bunny-ink px-4 py-3 font-medium text-bunny-chalk outline-none transition focus:border-bunny-orange focus-visible:ring-2 focus-visible:ring-bunny-orange/50'

  return (
    <section id="register" ref={ref} className="px-6 pt-32 pb-40 md:pt-48 md:pb-56">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="max-w-[14ch] font-display text-4xl font-medium tracking-[-0.03em] md:text-6xl">
            <SplitWords text={title} />
          </h2>
          <p data-reveal className="mt-6 max-w-[65ch] font-medium text-bunny-mute">
            {t('register.subtitle')}
          </p>
          <form data-reveal className="mt-10 grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="text-sm font-medium">
              <span>{t('register.fields.childName')}</span>
              <input className={fieldClass} {...register('childName')} />
              {errors.childName && <p className="mt-1 text-sm text-bunny-orange">{t('register.errors.childName')}</p>}
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span>{t('register.fields.age')}</span>
                <input type="number" className={fieldClass} {...register('age', { valueAsNumber: true })} />
                {errors.age && <p className="mt-1 text-sm text-bunny-orange">{t('register.errors.age')}</p>}
              </label>
              <fieldset>
                <legend>{t('register.fields.gender')}</legend>
                <div className="mt-3 flex gap-4">
                  {(['PA', 'PI'] as const).map((g) => (
                    <label key={g} className="flex min-h-11 items-center gap-2">
                      <input type="radio" value={g} {...register('gender')} />
                      {t(`register.gender.${g}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <label>
              <span>{t('register.fields.parentName')}</span>
              <input className={fieldClass} {...register('parentName')} />
              {errors.parentName && <p className="mt-1 text-sm text-bunny-orange">{t('register.errors.required')}</p>}
            </label>
            <label>
              <span>{t('register.fields.whatsapp')}</span>
              <input className={fieldClass} {...register('whatsapp')} />
              {errors.whatsapp && <p className="mt-1 text-sm text-bunny-orange">{t('register.errors.whatsapp')}</p>}
            </label>
            <label>
              <span>{t('register.fields.session')}</span>
              <select className={fieldClass} {...register('session')}>
                {schedule.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(`schedule.${s.dayId}`)} {s.start}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('register.fields.experience')}</span>
              <select className={fieldClass} {...register('experience')}>
                {(['none', 'lt1', '1to3', 'gt3'] as const).map((k) => (
                  <option key={k} value={k}>
                    {t(`register.experience.${k}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('register.fields.notes')}</span>
              <textarea className={fieldClass} rows={4} {...register('notes')} />
            </label>
            <Controller
              name="consent"
              control={control}
              render={({ field }) => (
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={Boolean(field.value)}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span>{t('register.consent')}</span>
                </label>
              )}
            />
            {errors.consent && <p className="text-sm text-bunny-orange">{t('register.errors.consent')}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('register.sending') : t('register.submit')}
            </Button>
          </form>
        </div>
        <aside data-reveal className="relative overflow-hidden rounded-sm bg-bunny-coal lg:col-span-5">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-bunny-orange" />
          <div className="border-b border-dashed border-bunny-steel px-8 py-6">
            <p className="font-sans text-xs font-medium tracking-[0.18em] text-bunny-orange">{t('register.ticketLabel')}</p>
            <p className="mt-2 font-display text-3xl font-medium tracking-tight">{t('register.quickTitle')}</p>
          </div>
          <div className="px-8 py-8">
            <p className="text-sm text-bunny-mute">{t('register.ticketNote')}</p>
            <a
              className="mt-6 flex min-h-11 items-center gap-2 font-semibold text-bunny-orange"
              href={buildWhatsAppUrl(site.whatsapp.number, 'Halo Bunny Ballers')}
            >
              {t('register.whatsappCta')} · {site.whatsapp.display}
            </a>
            <a className="mt-2 flex min-h-11 items-center gap-2 font-semibold" href={site.instagram}>
              {t('register.instagramCta')} {site.instagramHandle}
            </a>
            <p className="mt-10 flex gap-2 text-sm text-bunny-mute">
              <UsersThree size={20} />
              {site.venue}
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
