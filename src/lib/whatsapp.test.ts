import { describe, expect, it } from 'vitest'
import { trialSchema } from './schema'
import { buildWhatsAppUrl, formatTrialMessage } from './whatsapp'

describe('buildWhatsAppUrl', () => {
  it('encodes newlines and ampersands', () => {
    const url = buildWhatsAppUrl('6281315611616', 'Halo & tes\nbaris dua')
    expect(url).toContain('https://wa.me/6281315611616?text=')
    expect(url).toContain(encodeURIComponent('Halo & tes\nbaris dua'))
  })
})

describe('trialSchema', () => {
  it('accepts a valid payload', () => {
    const parsed = trialSchema.parse({
      childName: 'Andi',
      age: 12,
      gender: 'PA',
      parentName: 'Budi',
      whatsapp: '081315611616',
      session: 'fri',
      experience: 'none',
      consent: true,
    })
    expect(parsed.childName).toBe('Andi')
  })

  it('rejects invalid whatsapp and age', () => {
    const bad = trialSchema.safeParse({
      childName: 'A',
      age: 4,
      gender: 'PA',
      parentName: 'Budi',
      whatsapp: '123',
      session: 'fri',
      experience: 'none',
      consent: false,
    })
    expect(bad.success).toBe(false)
  })
})

describe('formatTrialMessage', () => {
  it('includes notes when present', () => {
    const msg = formatTrialMessage((k) => k, {
      childName: 'Andi',
      age: 12,
      gender: 'Putra',
      parentName: 'Budi',
      whatsapp: '0813',
      session: 'Jumat',
      experience: 'none',
      notes: 'alergi & asma',
    })
    expect(msg).toContain('Andi')
    expect(msg).toContain('alergi & asma')
  })
})
