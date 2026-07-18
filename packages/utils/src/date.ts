import { format, formatDistanceToNow } from 'date-fns'

export function formatOrderDate(date: Date | string | number): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm')
}

export function formatTimeAgo(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
