export const faqIds = ['beginner', 'ages', 'gear', 'trial', 'parents', 'makeup', 'compete'] as const

export type FaqId = (typeof faqIds)[number]
