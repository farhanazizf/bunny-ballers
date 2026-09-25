import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function useOnceReveal(
  ref: RefObject<HTMLElement | null>,
  reduced: boolean,
  deps: unknown[] = [],
  selector = '[data-reveal]',
) {
  useGSAP(
    () => {
      if (reduced || !ref.current) return
      const items = ref.current.querySelectorAll(selector)
      if (!items.length) return
      ScrollTrigger.config({ ignoreMobileResize: true })
      const mobile = window.matchMedia('(max-width: 767px)').matches
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0.06, y: mobile ? 40 : 22 },
          {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.65 : 0.75,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: mobile ? 'top 94%' : 'top 86%',
              once: true,
            },
          },
        )
      })
    },
    { dependencies: [reduced, ...deps] },
  )
}
