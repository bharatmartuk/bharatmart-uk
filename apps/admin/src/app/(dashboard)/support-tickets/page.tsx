import Link from 'next/link'
import { Badge, Card, CardContent } from '@bharatmart/ui'
import { SupportTicketService } from '@bharatmart/services'

export const dynamic = 'force-dynamic'

export default async function SupportTicketsPage() {
  const tickets = await SupportTicketService.list()

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Support tickets</h1>
        <p className="text-sm text-[#514534]">Triaging customer and merchant support threads.</p>
      </div>

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <Card className="border-dashed border-[#d6c4ad]">
            <CardContent className="p-6 text-sm text-[#514534]">
              No support tickets yet. Seed or create one from a customer flow later.
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card className="border-[#d6c4ad]" key={ticket.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link className="font-semibold hover:text-[#7f5700]" href={`/support-tickets/${ticket.id}`}>
                    {ticket.subject}
                  </Link>
                  <p className="text-sm text-[#514534]">
                    {ticket.raisedBy.name ?? ticket.raisedBy.email} · {ticket._count.messages}{' '}
                    messages
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{ticket.priority}</Badge>
                  <Badge>{ticket.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  )
}
