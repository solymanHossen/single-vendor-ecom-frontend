"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateTicketAction } from "@/actions/admin-ticket.actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type {
  TicketCategory,
  TicketPerson,
  TicketPriority,
  TicketStatus,
  TicketUpdate,
} from "@/lib/backend-tickets"
import { TICKET_CATEGORY_META, TICKET_PRIORITY_META, TICKET_STATUS_META } from "@/lib/ticket-meta"

const UNASSIGNED = "none"

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

/** Each change saves at once and lands on the timeline. */
export function TicketProperties({
  ticketId,
  status,
  priority,
  category,
  assigneeId,
  assignees,
  viewerId,
}: {
  ticketId: number
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  assigneeId: number | null
  assignees: TicketPerson[]
  viewerId: number
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  const save = (change: TicketUpdate, label: string) =>
    startTransition(async () => {
      const result = await updateTicketAction(ticketId, change)
      if ("error" in result) {
        toast.error("Couldn't update ticket", { description: result.error })
        return
      }
      toast.success("Ticket updated", { id: `ticket-${ticketId}-props`, description: label })
      router.refresh()
    })

  const trigger = "h-10 w-full rounded-xl text-[15px]"

  return (
    <div className="relative space-y-3">
      {pending && <Loader2 className="absolute -top-9 right-0 size-4 animate-spin text-muted-foreground" aria-label="Saving" />}
      <Row label="Status">
        <Select
          value={status}
          onValueChange={(value) =>
            save({ status: value as TicketStatus }, `Status: ${TICKET_STATUS_META[value as TicketStatus].staff}`)
          }
          disabled={pending}
        >
          <SelectTrigger aria-label="Status" className={trigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {(Object.keys(TICKET_STATUS_META) as TicketStatus[]).map((value) => {
              const meta = TICKET_STATUS_META[value]
              return (
                <SelectItem key={value} value={value}>
                  <meta.icon className="size-4" aria-hidden="true" />
                  {meta.staff}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </Row>
      <Row label="Assignee">
        <Select
          value={assigneeId === null ? UNASSIGNED : String(assigneeId)}
          onValueChange={(value) => {
            const next = value === UNASSIGNED ? null : Number(value)
            const person = assignees.find((item) => item.id === next)
            save({ assigneeId: next }, next === null ? "Unassigned" : `Assigned to ${person?.name ?? person?.email}`)
          }}
          disabled={pending}
        >
          <SelectTrigger aria-label="Assignee" className={trigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {assignees.map((person) => (
              <SelectItem key={person.id} value={String(person.id)}>
                {person.name ?? person.email}
                {person.id === viewerId && " (you)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
      <Row label="Priority">
        <Select
          value={priority}
          onValueChange={(value) =>
            save({ priority: value as TicketPriority }, `Priority: ${TICKET_PRIORITY_META[value as TicketPriority].label}`)
          }
          disabled={pending}
        >
          <SelectTrigger aria-label="Priority" className={trigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {(["HIGH", "MEDIUM", "LOW"] as const).map((value) => (
              <SelectItem key={value} value={value}>
                {TICKET_PRIORITY_META[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
      <Row label="Topic">
        <Select
          value={category}
          onValueChange={(value) =>
            save({ category: value as TicketCategory }, `Topic: ${TICKET_CATEGORY_META[value as TicketCategory].label}`)
          }
          disabled={pending}
        >
          <SelectTrigger aria-label="Topic" className={trigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {(Object.keys(TICKET_CATEGORY_META) as TicketCategory[]).map((value) => (
              <SelectItem key={value} value={value}>
                {TICKET_CATEGORY_META[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
    </div>
  )
}
