export const companions = [
  'Chipos', 'Galatea', 'Loutro', 'Magnes', 'Polymnia', 'Tomyios',
] as const

export type Companion = (typeof companions)[number] | ''
