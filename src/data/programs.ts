export type Program = {
  id: 'mini' | 'junior' | 'senior'
  ageMin: number
  ageMax: number
  points: 4
}

export const programs: Program[] = [
  { id: 'mini', ageMin: 6, ageMax: 9, points: 4 },
  { id: 'junior', ageMin: 10, ageMax: 14, points: 4 },
  { id: 'senior', ageMin: 15, ageMax: 18, points: 4 },
]
