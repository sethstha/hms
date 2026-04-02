import { format, formatDistanceToNow, differenceInYears } from 'date-fns'

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  return format(new Date(date), pattern)
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm a')
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function calculateAge(dateOfBirth: string | Date): number {
  return differenceInYears(new Date(), new Date(dateOfBirth))
}
