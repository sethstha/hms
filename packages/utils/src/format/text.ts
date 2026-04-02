export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}
