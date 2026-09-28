"use client"

import * as React from "react"
import { Crown, Loader2, Plus, ShieldCheck, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { deleteStaffRoleAction, saveStaffRoleAction } from "@/actions/access.actions"
import type { PermissionGroup, StaffRole } from "@/lib/backend-access"
import type { Permission } from "@/lib/permissions"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Field, INPUT_CLASS } from "@/components/admin/products/form-primitives"

interface Draft {
  name: string
  description: string
  permissions: Permission[]
}

type Selection = number | "new"

const EMPTY: Draft = { name: "", description: "", permissions: [] }

function draftOf(role: StaffRole | undefined): Draft {
  return role
    ? { name: role.name, description: role.description, permissions: [...role.permissions] }
    : EMPTY
}

function sameDraft(a: Draft, b: Draft): boolean {
  return (
    a.name.trim() === b.name.trim() &&
    a.description.trim() === b.description.trim() &&
    [...a.permissions].sort().join() === [...b.permissions].sort().join()
  )
}

export function RolesManager({
  initialRoles,
  catalog,
}: {
  initialRoles: StaffRole[]
  catalog: PermissionGroup[]
}) {
  const [roles, setRoles] = React.useState(initialRoles)
  const [selected, setSelected] = React.useState<Selection>(initialRoles[0]?.id ?? "new")
  const [draft, setDraft] = React.useState<Draft>(() => draftOf(initialRoles[0]))
  const [pendingSelect, setPendingSelect] = React.useState<Selection | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [saving, startSave] = React.useTransition()
  const [deleting, startDelete] = React.useTransition()

  const current = selected === "new" ? undefined : roles.find((role) => role.id === selected)
  const dirty = !sameDraft(draft, draftOf(current))
  const total = catalog.reduce((sum, group) => sum + group.permissions.length, 0)

  const select = (next: Selection) => {
    if (next === selected) return
    if (dirty) {
      setPendingSelect(next)
      return
    }
    setSelected(next)
    setDraft(draftOf(next === "new" ? undefined : roles.find((role) => role.id === next)))
  }

  const toggle = (key: Permission, on: boolean) =>
    setDraft((prev) => ({
      ...prev,
      permissions: on ? [...new Set([...prev.permissions, key])] : prev.permissions.filter((p) => p !== key),
    }))

  const toggleGroup = (group: PermissionGroup, on: boolean) =>
    setDraft((prev) => {
      const keys = group.permissions.map((p) => p.key)
      return {
        ...prev,
        permissions: on
          ? [...new Set([...prev.permissions, ...keys])]
          : prev.permissions.filter((p) => !keys.includes(p)),
      }
    })

  const save = () => {
    if (draft.name.trim().length < 2) {
      toast.warning("Give the role a name", { description: "At least 2 characters." })
      document.getElementById("role-name")?.focus()
      return
    }
    startSave(async () => {
      const result = await saveStaffRoleAction(current?.id ?? null, {
        name: draft.name.trim(),
        description: draft.description.trim(),
        permissions: draft.permissions,
      })
      if ("error" in result) {
        toast.error("Couldn't save the role", { description: result.error })
        return
      }
      const role = result.role
      setRoles((prev) =>
        (prev.some((item) => item.id === role.id) ? prev.map((item) => (item.id === role.id ? role : item)) : [...prev, role]).sort(
          (a, b) => a.name.localeCompare(b.name)
        )
      )
      setSelected(role.id)
      setDraft(draftOf(role))
      toast.success(current ? "Role updated" : "Role created", {
        description: current
          ? `Applies immediately to ${role.memberCount} ${role.memberCount === 1 ? "member" : "members"}.`
          : `Assign “${role.name}” to staff from their user page.`,
      })
    })
  }

  const remove = () => {
    if (!current) return
    startDelete(async () => {
      const result = await deleteStaffRoleAction(current.id)
      if ("error" in result) {
        setConfirmDelete(false)
        toast.error("Couldn't delete the role", { description: result.error })
        return
      }
      const rest = roles.filter((role) => role.id !== current.id)
      setRoles(rest)
      setConfirmDelete(false)
      setSelected(rest[0]?.id ?? "new")
      setDraft(draftOf(rest[0]))
      toast.success("Role deleted", { description: current.name })
    })
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="space-y-3 lg:sticky lg:top-6">
        <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
            <Crown className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-foreground">Super admin</span>
            <span className="block text-sm text-muted-foreground">
              Every permission, plus staff, roles and the activity log. Can&apos;t be edited.
            </span>
          </span>
        </div>

        <ul className="space-y-2" aria-label="Staff roles">
          {roles.map((role) => {
            const active = role.id === selected
            return (
              <li key={role.id}>
                <button
                  type="button"
                  onClick={() => select(role.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-[border-color,box-shadow]",
                    active
                      ? "border-foreground bg-card shadow-[0_0_0_1px_var(--foreground)]"
                      : "border-border/70 bg-card hover:border-foreground/40"
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{role.name}</span>
                    <span className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                      <span className="tabular-nums">
                        {role.permissions.length}/{total} permissions
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Users className="size-3.5" aria-hidden="true" />
                        {role.memberCount}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <Button
          variant="outline"
          className={cn("h-11 w-full rounded-xl border-dashed", selected === "new" && "border-foreground")}
          onClick={() => select("new")}
        >
          <Plus className="size-4" />
          New role
        </Button>
      </aside>

      <section className="rounded-3xl border border-border/70 bg-card">
        <div className="space-y-5 border-b border-border/70 p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {current ? `Edit “${current.name}”` : "New role"}
            </h2>
            {current && (
              <span className="text-sm text-muted-foreground">
                Used by {current.memberCount} staff {current.memberCount === 1 ? "member" : "members"}
              </span>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="role-name" label="Role name" counter={{ value: draft.name.length, max: 60 }}>
              <input
                id="role-name"
                value={draft.name}
                maxLength={60}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. Customer support"
                className={INPUT_CLASS}
              />
            </Field>
            <Field id="role-description" label="Description" optional counter={{ value: draft.description.length, max: 200 }}>
              <input
                id="role-description"
                value={draft.description}
                maxLength={200}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="What this role is for"
                className={INPUT_CLASS}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-5 p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-foreground">Permissions</h3>
            <span className="text-sm text-muted-foreground tabular-nums">
              {draft.permissions.length} of {total} selected
            </span>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {catalog.map((group) => {
              const keys = group.permissions.map((p) => p.key)
              const on = keys.filter((key) => draft.permissions.includes(key)).length
              return (
                <fieldset key={group.key} className="rounded-2xl border border-border/70">
                  <legend className="sr-only">{group.label}</legend>
                  <label className="flex cursor-pointer items-center justify-between gap-3 border-b border-border/70 bg-muted/40 px-4 py-3">
                    <span className="font-medium text-foreground">
                      {group.label}
                      <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
                        {on}/{keys.length}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      All
                      <Checkbox
                        checked={on === keys.length ? true : on > 0 ? "indeterminate" : false}
                        onCheckedChange={(checked) => toggleGroup(group, checked === true)}
                        aria-label={`All ${group.label} permissions`}
                      />
                    </span>
                  </label>
                  <ul className="divide-y divide-border/60">
                    {group.permissions.map((permission) => (
                      <li key={permission.key}>
                        <label className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/30">
                          <Checkbox
                            className="mt-0.5"
                            checked={draft.permissions.includes(permission.key)}
                            onCheckedChange={(checked) => toggle(permission.key, checked === true)}
                          />
                          <span className="min-w-0">
                            <span className="block text-[15px] font-medium text-foreground">{permission.label}</span>
                            <span className="block text-sm text-muted-foreground">{permission.description}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-6 py-4 sm:px-7">
          {current ? (
            <Button
              variant="ghost"
              className="h-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
              Delete role
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            {dirty && (
              <Button variant="outline" className="h-10 rounded-xl" disabled={saving} onClick={() => setDraft(draftOf(current))}>
                Discard
              </Button>
            )}
            <Button className="h-10 rounded-xl px-5 font-semibold" disabled={saving || (!dirty && !!current)} onClick={save}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {current ? "Save changes" : "Create role"}
            </Button>
          </div>
        </div>
      </section>

      <AlertDialog open={pendingSelect !== null} onOpenChange={(open) => !open && setPendingSelect(null)}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">
              Your edits to {current ? `“${current.name}”` : "the new role"} haven&apos;t been saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="rounded-xl"
              onClick={() => {
                const next = pendingSelect
                setPendingSelect(null)
                if (next === null) return
                setSelected(next)
                setDraft(draftOf(next === "new" ? undefined : roles.find((role) => role.id === next)))
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={(open) => !deleting && setConfirmDelete(open)}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {current && current.memberCount > 0 ? `“${current.name}” is still in use` : `Delete “${current?.name}”?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">
              {current && current.memberCount > 0
                ? `${current.memberCount} staff ${current.memberCount === 1 ? "member has" : "members have"} this role. Give them another role from their user page first.`
                : "The role is removed permanently. Nobody is using it."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={deleting}>
              {current && current.memberCount > 0 ? "Close" : "Cancel"}
            </AlertDialogCancel>
            {current && current.memberCount === 0 && (
              <AlertDialogAction
                variant="destructive"
                className="rounded-xl"
                disabled={deleting}
                onClick={(event) => {
                  event.preventDefault()
                  remove()
                }}
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Delete role
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
