/**
 * Generates a strong, secure random password
 */
export function generateStrongPassword(length = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const numbers = '23456789'
  const symbols = '!@#$%^&*-_'

  const allChars = upper + lower + numbers + symbols
  const array = new Uint32Array(length)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  }

  // Ensure at least 1 upper, 1 lower, 1 number, 1 symbol
  const passwordChars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ]

  for (let i = 4; i < length; i++) {
    const randomIndex = array[i] ? array[i] % allChars.length : Math.floor(Math.random() * allChars.length)
    passwordChars.push(allChars[randomIndex])
  }

  // Shuffle
  return passwordChars.sort(() => Math.random() - 0.5).join('')
}
