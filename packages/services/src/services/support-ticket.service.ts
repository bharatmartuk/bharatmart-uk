import 'server-only'

import { prisma } from '@bharatmart/database'
import { NotFoundError, ValidationError } from '../errors'
import { NotificationService } from './notification.service'

export const SupportTicketService = {
  list(filters?: { status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' }) {
    return prisma.supportTicket.findMany({
      ...(filters?.status ? { where: { status: filters.status } } : {}),
      include: {
        raisedBy: { select: { id: true, name: true, email: true } },
        assignedAdmin: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  getById(ticketId: string) {
    return prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        raisedBy: { select: { id: true, name: true, email: true } },
        assignedAdmin: { select: { id: true, name: true, email: true } },
      },
    })
  },

  getMessages(ticketId: string) {
    return prisma.ticketMessage.findMany({
      where: { ticketId },
      include: { author: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    })
  },

  async reply(ticketId: string, authorId: string, message: string) {
    if (!message.trim()) throw new ValidationError('Message cannot be empty.')

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) throw new NotFoundError('Ticket not found.')

    const created = await prisma.ticketMessage.create({
      data: {
        ticketId,
        authorId,
        message: message.trim(),
      },
    })

    const notifyUserId =
      authorId === ticket.raisedByUserId
        ? ticket.assignedAdminId
        : ticket.raisedByUserId

    if (notifyUserId) {
      await NotificationService.notifySupportReply(notifyUserId, ticket.subject)
    }

    return created
  },

  async updateStatus(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') {
    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    })
  },

  async updatePriority(ticketId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') {
    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: { priority },
    })
  },
}

export const supportTicketService = SupportTicketService
