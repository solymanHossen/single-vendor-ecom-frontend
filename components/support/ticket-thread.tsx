import { Lock, StickyNote } from "lucide-react"
import type { TicketMessage } from "@/lib/backend-tickets"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" })
const dayLabel = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})
const timeLabel = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  // Not `hour12: true`: with en-GB, Node renders midnight "0:00 am" but
  // browsers "12:00 am" — a hydration mismatch. h12 is identical everywhere.
  hourCycle: "h12",
  timeZone: "Asia/Dhaka",
})

function dividerLabel(iso: string, today: string, yesterday: string): string {
  const key = dayKey.format(new Date(iso))
  if (key === today) return "Today"
  if (key === yesterday) return "Yesterday"
  return dayLabel.format(new Date(iso))
}

function Attachments({ urls, mine }: { urls: string[]; mine: boolean }) {
  if (urls.length === 0) return null
  return (
    <div className={cn("mt-2 flex flex-wrap gap-2", mine && "justify-end")}>
      {urls.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-xl border border-border/70 transition-opacity hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- user uploads of any size */}
          <img src={url} alt="Attached photo" className="size-28 object-cover sm:size-32" loading="lazy" />
        </a>
      ))}
    </div>
  )
}

/**
 * The conversation, grouped by day. "Mine" (right-aligned) is the viewer's
 * side: the customer's messages for a customer, staff messages for staff.
 */
export function TicketThread({
  messages,
  audience,
  now,
  storeName,
}: {
  messages: TicketMessage[]
  audience: "customer" | "staff"
  /** Request time, for Today/Yesterday — passed in so server and client agree. */
  now: number
  storeName: string
}) {
  const today = dayKey.format(new Date(now))
  const yesterday = dayKey.format(new Date(now - 86_400_000))
  const days = messages.map((message) => dayKey.format(new Date(message.createdAt)))

  return (
    <ol className="space-y-5" aria-label="Conversation">
      {messages.map((message, index) => {
        const day = days[index]
        const divider =
          index === 0 || day !== days[index - 1] ? (
            <li key={`day-${day}`} className="flex items-center gap-3 py-1" aria-hidden="true">
              <span className="h-px flex-1 bg-border/70" />
              <span className="text-xs font-medium text-muted-foreground">
                {dividerLabel(message.createdAt, today, yesterday)}
              </span>
              <span className="h-px flex-1 bg-border/70" />
            </li>
          ) : null
        const time = timeLabel.format(new Date(message.createdAt))
        const who = message.sender?.name ?? (message.sender ? "Someone" : storeName)

        if (message.kind === "EVENT") {
          return [
            divider,
            <li key={message.id} className="flex justify-center">
              <p className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-center text-xs text-muted-foreground">
                {message.isInternal && <Lock className="size-3 shrink-0" aria-label="Staff only" />}
                <span>
                  {message.sender ? (
                    <>
                      <span className="font-medium text-foreground">
                        {audience === "customer" && message.fromStaff ? `${who} (support)` : who}
                      </span>{" "}
                      {message.message}
                    </>
                  ) : (
                    message.message
                  )}{" "}
                  · {time}
                </span>
              </p>
            </li>,
          ]
        }

        if (message.kind === "NOTE") {
          return [
            divider,
            <li key={message.id}>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                <p className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <StickyNote className="size-3.5" aria-hidden="true" />
                  Internal note · {who} · {time}
                </p>
                <p className="mt-1.5 text-[15px] break-words whitespace-pre-wrap text-foreground">{message.message}</p>
                <Attachments urls={message.attachments} mine={false} />
              </div>
            </li>,
          ]
        }

        const mine = audience === "customer" ? !message.fromStaff : message.fromStaff
        return [
          divider,
          <li key={message.id} className={cn("flex items-end gap-2.5", mine && "flex-row-reverse")}>
            {!mine && (
              <Avatar className="size-8 shrink-0">
                {message.sender?.avatarUrl && <AvatarImage src={message.sender.avatarUrl} alt="" />}
                <AvatarFallback className="text-[11px]">
                  {getInitials(message.sender?.name ?? storeName, message.sender?.email ?? null)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className={cn("flex max-w-[85%] min-w-0 flex-col sm:max-w-[75%]", mine && "items-end")}>
              <p className={cn("mb-1 px-1 text-xs text-muted-foreground", mine && "text-right")}>
                <span className="font-medium text-foreground">
                  {mine ? "You" : who}
                </span>
                {!mine && message.fromStaff && audience === "customer" && ` · ${storeName} support`}
                {" · "}
                {time}
              </p>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap",
                  mine
                    ? "rounded-br-md bg-foreground text-background"
                    : "rounded-bl-md border border-border/70 bg-card text-foreground"
                )}
              >
                {message.message}
              </div>
              <Attachments urls={message.attachments} mine={mine} />
            </div>
          </li>,
        ]
      })}
    </ol>
  )
}
