/**
 * Generates bamboo-slat backgrounds from a product's tone.
 * Used until real product photos are uploaded — if a product has images[0],
 * components use that photo instead.
 */
export const TONES = {
  natural: ['#d9bb83', '#ad884c', '#d2b077', '#b8935a'],
  honey: ['#d39d4f', '#9c6a26', '#c98f40', '#a8722d'],
  walnut: ['#8a5f3a', '#5b3a20', '#7e5533', '#5f3e24'],
  charcoal: ['#5c5853', '#363431', '#55514c', '#3c3936'],
  ivory: ['#efe3c8', '#c9b48b', '#e8dabb', '#cbb790']
};

export function slats(tone = 'natural', w = 7) {
  const c = TONES[tone] || TONES.natural;
  return `repeating-linear-gradient(0deg,${c[0]} 0 ${w}px,${c[1]} ${w}px ${w + 1}px,${c[2]} ${w + 1}px ${2 * w}px,${c[3]} ${2 * w}px ${2 * w + 1}px)`;
}

export function swatchBg({ tone, category, images } = {}) {
  if (images?.length) return `url("${images[0]}") center/cover`;
  const c = TONES[tone] || TONES.natural;
  if (category === 'Door') return `repeating-linear-gradient(90deg,${c[0]} 0 5px,${c[1]} 5px 7px)`;
  return slats(tone, category === 'Matchstick' ? 3 : 7);
}
