'use client'

import { useState, useTransition } from 'react'
import { Button, Input, Label } from '@bharatmart/ui'
import {
  replyToTicketAction,
  updateTicketPriorityAction,
  updateTicketStatusAction,
} from '@/app/(dashboard)/support-tickets/actions'

export function TicketThread({
  ticketId,
  status,
  priority,
  messages,
}: {
  ticketId: string
  status: string
  priority: string
  messages: Array<{
    id: string
    message: string
    createdAt: string
    authorName: string
    authorRole: string
  }>
}) {
  const [reply, setReply] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-md border border-[#d6c4ad] bg-white px-3 py-2 text-sm"
          defaultValue={status}
          onChange={(event) =>
            startTransition(async () =>
              updateTicketStatusAction(
                ticketId,
                event.target.value as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED',
              ),
            )
          }
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <select
          className="rounded-md border border-[#d6c4ad] bg-white px-3 py-2 text-sm"
          defaultValue={priority}
          onChange={(event) =>
            startTransition(async () =>
              updateTicketPriorityAction(
                ticketId,
                event.target.value as 'LOW' | 'MEDIUM' | 'HIGH',
              ),
            )
          }
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-[#514534]">No messages yet.</p>
        ) : (
          messages.map((entry) => (
            <div className="rounded-lg bg-[#f9f3ea] p-3 text-sm" key={entry.id}>
              <p className="font-medium">
                {entry.authorName} · {entry.authorRole}
              </p>
              <p className="mt-1 text-[#514534]">{entry.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <Label>Reply</Label>
        <Input onChange={(event) => setReply(event.target.value)} value={reply} />
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await replyToTicketAction(ticketId, reply)
              setMessage(result.ok ? 'Reply sent.' : result.error)
              if (result.ok) setReply('')
            })
          }
          type="button"
        >
          Send reply
        </Button>
        {message ? <p className="text-sm text-[#514534]">{message}</p> : null}
      </div>
    </div>
  )
}
