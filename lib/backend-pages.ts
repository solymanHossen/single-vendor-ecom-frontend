import { backendFetch, parseJson } from "./backend-client"

export interface PageData {
  id: number
  slug: string
  title: string
  content: string
  updatedAt: string
}

export async function getPage(slug: string): Promise<PageData | null> {
  const response = await backendFetch(`/pages/${slug}`)
  if (response.status === 404) return null
  if (!response.ok) return null
  
  const body = await parseJson<{ data: PageData }>(response)
  return body.data
}

export async function getAdminPages(accessToken: string): Promise<PageData[]> {
  const response = await backendFetch(`/admin/pages`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!response.ok) return []
  const body = await parseJson<{ data: PageData[] }>(response)
  return body.data
}

export async function getAdminPage(accessToken: string, id: number): Promise<PageData | null> {
  const response = await backendFetch(`/admin/pages/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!response.ok) return null
  const body = await parseJson<{ data: PageData }>(response)
  return body.data
}

export async function updateAdminPage(
  accessToken: string,
  id: number,
  data: Partial<PageData>
): Promise<PageData | null> {
  const response = await backendFetch(`/admin/pages/${id}`, {
    method: "PUT",
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) return null
  const body = await parseJson<{ data: PageData }>(response)
  return body.data
}
