"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  addToCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "@/actions/cart.actions"
import { EMPTY_CART, type Cart, type CartLine } from "@/lib/backend-commerce"

interface AddInput {
  productId: number
  variantId?: number
  quantity: number
  /** Shown in the toast, e.g. "Sony WH-1000XM6". */
  name: string
}

interface CartContextValue {
  cart: Cart
  ready: boolean
  open: boolean
  setOpen: (open: boolean) => void
  add: (input: AddInput, options?: { openDrawer?: boolean }) => Promise<boolean>
  setQuantity: (key: string, quantity: number) => void
  remove: (line: CartLine) => void
  refresh: () => Promise<void>
  /** Line just added — the drawer highlights it briefly. */
  lastAddedKey: string | null
}

const CartContext = React.createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext)
  if (!context) throw new Error("useCart must be used inside <CartProvider>")
  return context
}

/** Recomputes totals after a local (optimistic) change. */
function withTotals(items: CartLine[]): Cart {
  const lines = items.map((line) => ({
    ...line,
    subtotal: String(Number(line.unitPrice) * line.quantity),
  }))
  return {
    items: lines,
    totalItems: lines.reduce((sum, line) => sum + line.quantity, 0),
    totalPrice: String(lines.reduce((sum, line) => sum + Number(line.subtotal), 0)),
    hasIssues: lines.some((line) => line.issue !== null),
  }
}

const QUANTITY_DEBOUNCE_MS = 350

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const [cart, setCart] = React.useState<Cart>(EMPTY_CART)
  const [ready, setReady] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [lastAddedKey, setLastAddedKey] = React.useState<string | null>(null)

  // Quantity edits are optimistic and debounced per line: rapid +/+/+ sends
  // one request with the final value, and a server reply never clobbers a
  // line the shopper is still editing.
  const pending = React.useRef(new Map<string, { quantity: number; timer: number }>())

  const applyServerCart = React.useCallback((next: Cart) => {
    if (pending.current.size === 0) {
      setCart(next)
      return
    }
    setCart(
      withTotals(
        next.items.map((line) => {
          const local = pending.current.get(line.key)
          return local ? { ...line, quantity: local.quantity } : line
        })
      )
    )
  }, [])

  const refresh = React.useCallback(async () => {
    applyServerCart(await getCartAction())
    setReady(true)
  }, [applyServerCart])

  // Load on mount and whenever the session changes: signing in merges the
  // guest cart server-side, signing out shows the (empty) guest cart.
  React.useEffect(() => {
    if (status === "loading") return
    let active = true
    void getCartAction().then((next) => {
      if (!active) return
      applyServerCart(next)
      setReady(true)
    })
    return () => {
      active = false
    }
  }, [status, applyServerCart])

  const add = React.useCallback<CartContextValue["add"]>(
    async ({ name, ...input }, options = {}) => {
      const result = await addToCartAction(input)
      applyServerCart(result.cart)
      if ("error" in result) {
        toast.error("Couldn't add to cart", { description: result.error })
        return false
      }
      const key = input.variantId ? `${input.productId}:${input.variantId}` : String(input.productId)
      setLastAddedKey(key)
      window.setTimeout(() => setLastAddedKey((current) => (current === key ? null : current)), 2200)
      if (options.openDrawer ?? true) setOpen(true)
      else toast.success("Added to cart", { description: name })
      return true
    },
    [applyServerCart]
  )

  const setQuantity = React.useCallback(
    (key: string, quantity: number) => {
      setCart((current) =>
        withTotals(current.items.map((line) => (line.key === key ? { ...line, quantity } : line)))
      )
      const existing = pending.current.get(key)
      if (existing) window.clearTimeout(existing.timer)
      const timer = window.setTimeout(async () => {
        const latest = pending.current.get(key)?.quantity ?? quantity
        const result = await updateCartLineAction(key, latest)
        if (pending.current.get(key)?.timer === timer) pending.current.delete(key)
        applyServerCart(result.cart)
        if ("error" in result) {
          toast.error("Couldn't update quantity", { id: `cart-qty-${key}`, description: result.error })
        }
      }, QUANTITY_DEBOUNCE_MS)
      pending.current.set(key, { quantity, timer })
    },
    [applyServerCart]
  )

  const remove = React.useCallback(
    (line: CartLine) => {
      const queued = pending.current.get(line.key)
      if (queued) {
        window.clearTimeout(queued.timer)
        pending.current.delete(line.key)
      }
      setCart((current) => withTotals(current.items.filter((item) => item.key !== line.key)))
      void removeCartLineAction(line.key).then((result) => {
        applyServerCart(result.cart)
        if ("error" in result) {
          toast.error("Couldn't remove item", { description: result.error })
          return
        }
        toast(`Removed ${line.name}`, {
          id: `cart-removed-${line.key}`,
          description: line.variantLabel ?? undefined,
          action: {
            label: "Undo",
            onClick: () =>
              void add(
                {
                  productId: line.productId,
                  variantId: line.variantId ?? undefined,
                  quantity: line.quantity,
                  name: line.name,
                },
                { openDrawer: false }
              ),
          },
        })
      })
    },
    [add, applyServerCart]
  )

  const value = React.useMemo<CartContextValue>(
    () => ({ cart, ready, open, setOpen, add, setQuantity, remove, refresh, lastAddedKey }),
    [cart, ready, open, add, setQuantity, remove, refresh, lastAddedKey]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
