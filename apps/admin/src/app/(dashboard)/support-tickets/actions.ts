'use server'

import { revalidatePath } from 'next/cache'
import { SupportTicketService, ValidationError } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export async function replyToTicketAction(ticketId: string, message: string) {
  const admin = await getCurrentUser()
  if (!admin) return { ok: false as const, error: 'Unauthorized' }

  try {
    await SupportTicketService.reply(ticketId, admin.id, message)
    revalidatePath('/support-tickets')
    revalidatePath(`/support-tickets/${ticketId}`)
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ValidationError ? error.message : 'Unable to send reply.',
    }
  }
}

export async function updateTicketStatusAction(
  ticketId: string,
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED',
) {
  await SupportTicketService.updateStatus(ticketId, status)
  revalidatePath('/support-tickets')
  revalidatePath(`/support-tickets/${ticketId}`)
}

export async function updateTicketPriorityAction(
  ticketId: string,
  priority: 'LOW' | 'MEDIUM' | 'HIGH',
) {
  await SupportTicketService.updatePriority(ticketId, priority)
  revalidatePath('/support-tickets')
  revalidatePath(`/support-tickets/${ticketId}`)
}
