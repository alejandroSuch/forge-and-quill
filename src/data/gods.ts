export const gods = [
  'Aphrodite', 'Apollo', 'Ares', 'Artemis', 'Athena', 'Demeter',
  'Hades', 'Hera', 'Hermes', 'Nemesis', 'Orion', 'Poseidon',
  'Tethys', 'Vulcan', 'Zeus',
] as const

export type God = (typeof gods)[number] | ''
