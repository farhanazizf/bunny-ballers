import { asset } from '../lib/asset'

export type Photo = {
  src: string
  alt: string
  w: number
  h: number
  tag: 'latihan' | 'tim' | 'sparring'
}

export const gallery: Photo[] = [
  {
    src: asset('gallery/1.png'),
    alt: 'Pemain Bunny Ballers latihan dribble di court indoor',
    w: 1506,
    h: 1006,
    tag: 'latihan',
  },
  {
    src: asset('gallery/2.png'),
    alt: 'Tim Bunny Ballers foto bersama usai sparring Dewa U-16',
    w: 1592,
    h: 1366,
    tag: 'tim',
  },
  {
    src: asset('gallery/3.png'),
    alt: 'Pemain Bunny Ballers jersey 9 menyerang ke ring saat sparring',
    w: 1560,
    h: 1494,
    tag: 'sparring',
  },
  {
    src: asset('gallery/4.png'),
    alt: 'Sesi drill cone di gym, pemain putri membawa bola',
    w: 876,
    h: 980,
    tag: 'latihan',
  },
  {
    src: asset('gallery/5.png'),
    alt: 'Huddle tim putri Bunny Ballers dengan jersey hijau di court',
    w: 880,
    h: 854,
    tag: 'tim',
  },
  {
    src: asset('gallery/6.png'),
    alt: 'Pemanasan plank di court, pemain Mini sampai Junior bersama pelatih',
    w: 1578,
    h: 1188,
    tag: 'latihan',
  },
]
