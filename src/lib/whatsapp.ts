export function buildWhatsAppUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

export function formatTrialMessage(
  t: (key: string) => string,
  fields: {
    childName: string
    age: number
    gender: string
    parentName: string
    whatsapp: string
    session: string
    experience: string
    notes?: string
  },
): string {
  const lines = [
    t('register.messageIntro'),
    '',
    `${t('register.fields.childName')}: ${fields.childName}`,
    `${t('register.fields.age')}: ${fields.age}`,
    `${t('register.fields.gender')}: ${fields.gender}`,
    `${t('register.fields.parentName')}: ${fields.parentName}`,
    `${t('register.fields.whatsapp')}: ${fields.whatsapp}`,
    `${t('register.fields.session')}: ${fields.session}`,
    `${t('register.fields.experience')}: ${fields.experience}`,
  ]
  if (fields.notes?.trim()) {
    lines.push(`${t('register.fields.notes')}: ${fields.notes.trim()}`)
  }
  return lines.join('\n')
}
