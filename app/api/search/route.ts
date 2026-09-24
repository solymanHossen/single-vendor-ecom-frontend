import { type NextRequest } from "next/server"
import { z } from "zod"
import { backendFetch, parseJson } from "@/lib/backend-client"
import type { SearchResponse, SearchResult } from "@/lib/storefront-types"

const SEARCH_RESULT_LIMIT = 6

const SearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(150),
})

interface BackendProduct {
  id: number
  name: string
  slug: string
  basePrice: string
  discountPrice: string | null
  category: { name: string; slug: string }
  images: Array<{ url: string; isThumbnail: boolean }>
}

interface BackendProductPage {
  data: { items: BackendProduct[]; meta: { total: number } }
}

function toResult(product: BackendProduct): SearchResult {
  const thumbnail =
    product.images.find((image) => image.isThumbnail) ?? product.images[0]
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    thumbnailUrl: thumbnail?.url ?? null,
    basePrice: product.basePrice,
    discountPrice: product.discountPrice,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
  }
}

/**
 * Search-as-you-type proxy for the header command palette.
 *
 * Keeps the backend URL server-side, trims the heavy product payload
 * (descriptions, variants) down to what a suggestion row renders, and lets
 * identical queries from many shoppers share one cached backend call.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const parsed = SearchQuerySchema.safeParse({
    q: request.nextUrl.searchParams.get("q") ?? "",
  })
  if (!parsed.success) {
    return Response.json(
      { message: 'Query parameter "q" is required.' },
      { status: 400 }
    )
  }

  const query = parsed.data.q
  const params = new URLSearchParams({
    search: query,
    isPublished: "true",
    limit: String(SEARCH_RESULT_LIMIT),
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  try {
    const response = await backendFetch(`/products?${params.toString()}`, {
      next: { revalidate: 60 },
    })
    const page = await parseJson<BackendProductPage>(response)

    const body: SearchResponse = {
      query,
      results: page.data.items.map(toResult),
      total: page.data.meta.total,
    }
    return Response.json(body, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
      },
    })
  } catch (error: unknown) {
    console.error("[search] backend request failed:", error)
    return Response.json(
      { message: "Search is temporarily unavailable." },
      { status: 502 }
    )
  }
}
