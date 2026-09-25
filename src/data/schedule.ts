export type Session = {
  id: 'fri' | 'sat'
  dayId: 'friday' | 'saturday'
  start: string
  end: string
  ageRange: string
  gender: 'PA/PI'
}

export const schedule: Session[] = [
  { id: 'fri', dayId: 'friday', start: '18:00', end: '20:00', ageRange: 'KU 6-18', gender: 'PA/PI' },
  { id: 'sat', dayId: 'saturday', start: '10:00', end: '12:00', ageRange: 'KU 6-18', gender: 'PA/PI' },
]
