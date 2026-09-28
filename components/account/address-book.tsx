"use client"

import * as React from "react"
import { Loader2, MapPin, Pencil, Phone, Plus, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteAddressAction, updateAddressAction } from "@/actions/address.actions"
import type { Address } from "@/lib/backend-commerce"
import { cn } from "@/lib/utils"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AddressForm } from "@/components/checkout/address-form"

type Editing = { mode: "new" } | { mode: "edit"; address: Address } | null

function sortAddresses(addresses: Address[]): Address[] {
  return [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.id - a.id)
}

export function AddressBook({
  initial,
  contact,
}: {
  initial: Address[]
  contact: { name: string | null; phone: string | null }
}) {
  const [addresses, setAddresses] = React.useState(() => sortAddresses(initial))
  const [editing, setEditing] = React.useState<Editing>(null)
  const [deleting, setDeleting] = React.useState<Address | null>(null)
  const [busyId, setBusyId] = React.useState<number | null>(null)
  const [pending, startTransition] = React.useTransition()

  const saved = (address: Address) => {
    setAddresses((current) =>
      sortAddresses([
        address,
        ...current
          .filter((item) => item.id !== address.id)
          .map((item) => (address.isDefault ? { ...item, isDefault: false } : item)),
      ])
    )
    setEditing(null)
  }

  const makeDefault = (address: Address) => {
    setBusyId(address.id)
    startTransition(async () => {
      const result = await updateAddressAction(address.id, { isDefault: true })
      setBusyId(null)
      if ("error" in result) {
        toast.error("Couldn't change your default", { description: result.error })
        return
      }
      saved(result.address)
      toast.success("Default address updated", {
        description: "Checkout will pick this address first.",
      })
    })
  }

  const confirmDelete = () => {
    const target = deleting
    if (!target) return
    startTransition(async () => {
      const result = await deleteAddressAction(target.id)
      if ("error" in result) {
        toast.error("Couldn't delete the address", { description: result.error })
        return
      }
      setDeleting(null)
      setAddresses((current) => {
        const rest = current.filter((item) => item.id !== target.id)
        // Mirrors the API: the newest remaining address becomes the default.
        if (target.isDefault && rest.length > 0 && !rest.some((item) => item.isDefault)) {
          const newest = rest.reduce((a, b) => (b.id > a.id ? b : a))
          return sortAddresses(rest.map((item) => (item.id === newest.id ? { ...item, isDefault: true } : item)))
        }
        return rest
      })
      toast.success("Address deleted")
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Addresses</h1>
          <p className="text-base text-muted-foreground">
            Save the places you order to. Your default is picked first at checkout.
          </p>
        </div>
        {addresses.length > 0 && (
          <Button className="h-11 rounded-xl px-5 font-semibold" onClick={() => setEditing({ mode: "new" })}>
            <Plus className="size-4" />
            Add address
          </Button>
        )}
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-5 rounded-3xl border-2 border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted">
            <MapPin className="size-7 text-muted-foreground" />
          </span>
          <div className="space-y-1.5">
            <p className="text-lg font-semibold text-foreground">No saved addresses</p>
            <p className="text-[15px] text-muted-foreground">Add one now and checkout takes seconds.</p>
          </div>
          <Button className="h-11 rounded-xl px-6 font-semibold" onClick={() => setEditing({ mode: "new" })}>
            <Plus className="size-4" />
            Add your first address
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address.id}
              className={cn(
                "flex flex-col gap-5 rounded-3xl border bg-card p-6",
                address.isDefault ? "border-foreground/80 shadow-[0_0_0_1px_var(--foreground)]" : "border-border/70"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-foreground">
                      {address.recipientName ?? "Recipient"}
                    </span>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
                        <Star className="size-3 fill-current" aria-hidden="true" />
                        Default
                      </span>
                    )}
                  </p>
                  {address.phone && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
                      <Phone className="size-3.5" aria-hidden="true" />
                      {address.phone}
                    </p>
                  )}
                </div>
              </div>
              <p className="flex-1 text-[15px] leading-relaxed text-muted-foreground">
                {[address.addressLine1, address.addressLine2].filter(Boolean).join(", ")}
                <br />
                {address.city} {address.postalCode}, {address.state} · {address.country}
              </p>
              <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
                <Button
                  variant="outline"
                  className="h-9 rounded-lg"
                  onClick={() => setEditing({ mode: "edit", address })}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    className="h-9 rounded-lg"
                    disabled={pending}
                    onClick={() => makeDefault(address)}
                  >
                    {busyId === address.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Star className="size-3.5" />
                    )}
                    Set as default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="ml-auto h-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleting(address)}
                  aria-label={`Delete address for ${address.recipientName ?? "recipient"}`}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[92dvh] gap-6 overflow-y-auto rounded-3xl p-7 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editing?.mode === "edit" ? "Edit address" : "Add a new address"}
            </DialogTitle>
            <DialogDescription className="text-[15px]">
              We deliver across Bangladesh. The courier calls the mobile number before arriving.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <AddressForm
              key={editing.mode === "edit" ? editing.address.id : "new"}
              address={editing.mode === "edit" ? editing.address : undefined}
              defaults={contact}
              isFirst={addresses.length === 0}
              submitLabel={editing.mode === "edit" ? "Save changes" : "Save address"}
              onCancel={() => setEditing(null)}
              onSaved={saved}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && !pending && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">
              {deleting?.addressLine1}, {deleting?.city} will be removed from your address book.
              Past orders keep their delivery details.
              {deleting?.isDefault && addresses.length > 1 && " Your newest other address becomes the default."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={pending}>
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="rounded-xl"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault()
                confirmDelete()
              }}
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Delete address
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
