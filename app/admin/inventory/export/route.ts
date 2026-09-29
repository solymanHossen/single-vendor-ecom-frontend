import { tokenIfPermitted } from "@/lib/action-auth"
import { exportInventory } from "@/lib/backend-inventory"

/** Streams the API's CSV to the browser; the access token never leaves the server. */
export async function GET() {
  const token = await tokenIfPermitted("catalog.manage")
  if (!token) return new Response("Forbidden", { status: 403 })
  const upstream = await exportInventory(token)
  if (!upstream.ok) return new Response("Export failed", { status: upstream.status })
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        upstream.headers.get("Content-Disposition") ?? `attachment; filename="inventory.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
