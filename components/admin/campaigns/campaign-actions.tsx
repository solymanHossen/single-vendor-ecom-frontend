"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink, Loader2, MoreHorizontal, Pencil, Power, PowerOff, Square, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteCampaignAction, endCampaignAction, updateCampaignAction } from "@/actions/campaign.actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Campaign } from "@/lib/backend-campaigns"

type Confirm = "end" | "delete" | null

/** ⋯ menu for a campaign: edit, view, publish/unpublish, end now, delete. */
export function CampaignActions({
  campaign,
  afterDelete = "refresh",
}: {
  campaign: Pick<Campaign, "id" | "name" | "slug" | "status" | "isActive" | "stats">
  /** On the edit page, deleting returns to the list. */
  afterDelete?: "refresh" | "list"
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [confirm, setConfirm] = React.useState<Confirm>(null)
  const running = campaign.status === "LIVE" || campaign.status === "SCHEDULED"
  const sold = campaign.stats.units > 0

  const run = (work: () => Promise<object>, success: string, description?: string, then?: () => void) =>
    startTransition(async () => {
      const result = (await work()) as { error?: string }
      setConfirm(null)
      if (result.error) {
        toast.error("Couldn't update the campaign", { description: result.error })
        return
      }
      toast.success(success, { description })
      if (then) then()
      else router.refresh()
    })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative z-10 size-9 rounded-lg" aria-label={`Actions for ${campaign.name}`} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
          <DropdownMenuItem asChild className="h-9 rounded-lg">
            <Link href={`/admin/campaigns/${campaign.id}`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </DropdownMenuItem>
          {campaign.isActive && (
            <DropdownMenuItem asChild className="h-9 rounded-lg">
              <Link href={`/campaigns/${campaign.slug}`} target="_blank">
                <ExternalLink className="size-4" /> View sale page
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="h-9 rounded-lg"
            onSelect={() =>
              run(
                () => updateCampaignAction(campaign.id, { isActive: !campaign.isActive }),
                campaign.isActive ? "Unpublished" : "Published",
                campaign.isActive ? "Sale prices are off and the page is hidden." : "It runs on its schedule."
              )
            }
          >
            {campaign.isActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
            {campaign.isActive ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          {running && (
            <DropdownMenuItem className="h-9 rounded-lg" onSelect={() => setConfirm("end")}>
              <Square className="size-4" /> End now
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" className="h-auto rounded-lg py-2" disabled={sold} onSelect={() => setConfirm("delete")}>
            <Trash2 className="size-4" />
            <span className="flex flex-col">
              Delete
              {sold && <span className="text-xs font-normal text-muted-foreground">Has sales — end it instead</span>}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm === "end" ? `End “${campaign.name}” now?` : `Delete “${campaign.name}”?`}</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">
              {confirm === "end"
                ? "Sale prices stop straight away, and carts go back to regular prices. Orders already placed keep their price."
                : "The campaign and its page are removed. Nothing was sold with it, so no history is lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-10 rounded-xl bg-destructive text-white hover:bg-destructive/90"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault()
                if (confirm === "end") run(() => endCampaignAction(campaign.id), "Campaign ended", "Prices are back to normal.")
                else
                  run(() => deleteCampaignAction(campaign.id), "Campaign deleted", undefined, () =>
                    afterDelete === "list" ? router.push("/admin/campaigns") : router.refresh()
                  )
              }}
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {confirm === "end" ? "End sale" : "Delete campaign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
