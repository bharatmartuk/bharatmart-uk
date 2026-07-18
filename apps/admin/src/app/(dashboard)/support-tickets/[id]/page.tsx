import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { SupportTicketService } from '@bharatmart/services'
import { TicketThread } from '@/components/support/TicketThread'

export const dynamic = 'force-dynamic'

export default async function SupportTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [ticket, messages] = await Promise.all([
    SupportTicketService.getById(id),
    SupportTicketService.getMessages(id),
  ])
  if (!ticket) notFound()

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{ticket.subject}</h1>
        <p className="text-sm text-[#514534]">
          Raised by {ticket.raisedBy.name ?? ticket.raisedBy.email}
        </p>
      </div>

      <Card className="border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>Thread</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketThread
            messages={messages.map((message) => ({
              id: message.id,
              message: message.message,
              createdAt: message.createdAt.toISOString(),
              authorName: message.author.name ?? message.author.email ?? 'User',
              authorRole: message.author.role,
            }))}
            priority={ticket.priority}
            status={ticket.status}
            ticketId={ticket.id}
          />
        </CardContent>
      </Card>
    </main>
  )
}
