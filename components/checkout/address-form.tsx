"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createAddressAction } from "@/actions/order.actions"
import type { Address, AddressInput } from "@/lib/backend-commerce"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, INPUT_CLASS } from "@/components/admin/products/form-primitives"

const DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
] as const

const CITY_SUGGESTIONS = [
  "Dhaka",
  "Gazipur",
  "Narayanganj",
  "Chattogram",
  "Cumilla",
  "Cox's Bazar",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Bogura",
]

/** Same rule as the API: 01XXXXXXXXX, optionally prefixed with +88 / 88. */
const BD_MOBILE = /^(?:\+?88)?01[3-9]\d{8}$/

type Values = Omit<AddressInput, "country" | "isDefault" | "addressLine2"> & {
  addressLine2: string
  isDefault: boolean
}
type Errors = Partial<Record<keyof Values, string>>

function validate(values: Values): Errors {
  const errors: Errors = {}
  if (values.recipientName.trim().length < 2) errors.recipientName = "Enter the recipient's name"
  if (!BD_MOBILE.test(values.phone.replace(/[\s-]/g, "")))
    errors.phone = "Enter a valid mobile number, e.g. 01712345678"
  if (!values.addressLine1.trim()) errors.addressLine1 = "Enter house, road and area"
  if (!values.city.trim()) errors.city = "Enter the city or district"
  if (!values.state) errors.state = "Choose a division"
  if (!/^\d{4}$/.test(values.postalCode.trim())) errors.postalCode = "Use the 4-digit postcode"
  return errors
}

export function AddressForm({
  defaults,
  isFirst,
  onSaved,
  onCancel,
}: {
  defaults: { name: string | null; phone: string | null }
  isFirst: boolean
  onSaved: (address: Address) => void
  onCancel?: () => void
}) {
  const [values, setValues] = React.useState<Values>({
    recipientName: defaults.name ?? "",
    phone: defaults.phone ?? "",
    addressLine1: "",
    addressLine2: "",
    city: "Dhaka",
    state: "Dhaka",
    postalCode: "",
    isDefault: isFirst,
  })
  const [errors, setErrors] = React.useState<Errors>({})
  const [saving, startSave] = React.useTransition()

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const submit = () => {
    const found = validate(values)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      document.getElementById(`address-${first}`)?.focus()
      return
    }
    startSave(async () => {
      const result = await createAddressAction({
        recipientName: values.recipientName.trim(),
        phone: values.phone.replace(/[\s-]/g, ""),
        addressLine1: values.addressLine1.trim(),
        ...(values.addressLine2.trim() && { addressLine2: values.addressLine2.trim() }),
        city: values.city.trim(),
        state: values.state,
        postalCode: values.postalCode.trim(),
        country: "Bangladesh",
        isDefault: values.isDefault,
      })
      if ("error" in result) {
        toast.error("Couldn't save address", { description: result.error })
        return
      }
      toast.success("Address saved", { description: `Delivering to ${result.address.city}.` })
      onSaved(result.address)
    })
  }

  return (
    <div
      className="space-y-5"
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.target as HTMLElement).tagName === "INPUT") {
          event.preventDefault()
          submit()
        }
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="address-recipientName" label="Full name" error={errors.recipientName}>
          <input
            id="address-recipientName"
            value={values.recipientName}
            onChange={(event) => set("recipientName", event.target.value)}
            autoComplete="name"
            aria-invalid={!!errors.recipientName}
            className={INPUT_CLASS}
          />
        </Field>
        <Field
          id="address-phone"
          label="Mobile number"
          error={errors.phone}
          hint="The courier calls this number before delivery."
        >
          <input
            id="address-phone"
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(event) => set("phone", event.target.value)}
            placeholder="01712345678"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            className={cn(INPUT_CLASS, "tabular-nums")}
          />
        </Field>
      </div>

      <Field id="address-addressLine1" label="Address" error={errors.addressLine1}>
        <input
          id="address-addressLine1"
          value={values.addressLine1}
          onChange={(event) => set("addressLine1", event.target.value)}
          placeholder="House 12, Road 5, Dhanmondi"
          autoComplete="address-line1"
          aria-invalid={!!errors.addressLine1}
          className={INPUT_CLASS}
        />
      </Field>
      <Field id="address-addressLine2" label="Apartment, floor or landmark" optional>
        <input
          id="address-addressLine2"
          value={values.addressLine2}
          onChange={(event) => set("addressLine2", event.target.value)}
          placeholder="Flat 4B, near Dhanmondi Lake"
          autoComplete="address-line2"
          className={INPUT_CLASS}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="address-city" label="City / district" error={errors.city}>
          <input
            id="address-city"
            list="address-city-options"
            value={values.city}
            onChange={(event) => set("city", event.target.value)}
            autoComplete="address-level2"
            aria-invalid={!!errors.city}
            className={INPUT_CLASS}
          />
          <datalist id="address-city-options">
            {CITY_SUGGESTIONS.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </Field>
        <Field id="address-state" label="Division" error={errors.state}>
          <Select value={values.state} onValueChange={(value) => set("state", value)}>
            <SelectTrigger
              id="address-state"
              className="h-11! w-full rounded-xl text-[15px]"
              aria-invalid={!!errors.state}
            >
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent position="popper" className="rounded-xl">
              {DIVISIONS.map((division) => (
                <SelectItem key={division} value={division}>
                  {division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="address-postalCode" label="Postcode" error={errors.postalCode}>
          <input
            id="address-postalCode"
            inputMode="numeric"
            value={values.postalCode}
            onChange={(event) => set("postalCode", event.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="1205"
            autoComplete="postal-code"
            aria-invalid={!!errors.postalCode}
            className={cn(INPUT_CLASS, "tabular-nums")}
          />
        </Field>
      </div>

      {!isFirst && (
        <label className="flex cursor-pointer items-center gap-3 text-[15px] text-foreground">
          <Checkbox
            checked={values.isDefault}
            onCheckedChange={(checked) => set("isDefault", checked === true)}
          />
          Make this my default address
        </label>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={submit} disabled={saving} className="h-11 rounded-xl px-6 font-semibold">
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save and deliver here
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving} className="h-11 rounded-xl">
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
