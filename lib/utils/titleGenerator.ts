export const generateRandomTitle = (): string => {
  const adjectives = [
    'Mystic',
    'Epic',
    'Dreamy',
    'Dark',
    'Cosmic',
    'Ethereal',
    'Vibrant',
    'Silent',
    'Golden',
    'Electric',
  ]
  const nouns = [
    'Music',
    'Melody',
    'Rhythm',
    'Harmony',
    'Symphony',
    'Beat',
    'Tune',
    'Sound',
    'Vibe',
    'Echo',
  ]

  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]

  return `${randomAdj} ${randomNoun}`
}
