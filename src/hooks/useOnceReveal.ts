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
      gsap.fromTo(
        items,
        { opacity: 0.1, y: 22 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.07,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 82%',
            once: true,
          },
        },
      )
    },
    { dependencies: [reduced, ...deps] },
  )
}
