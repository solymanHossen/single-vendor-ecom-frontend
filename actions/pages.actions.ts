'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { updateAdminPage } from '@/lib/backend-pages'

export async function updatePageAction(id: number, data: { title: string; content: string }) {
  const session = await auth()
  if (!session?.accessToken) return { error: 'Unauthorized' }

  try {
    const updated = await updateAdminPage(session.accessToken, id, data)
    if (!updated) return { error: 'Failed to update page' }
    
    // Revalidate the dynamic route cache
    revalidatePath(`/${updated.slug}`)
    revalidatePath('/admin/pages')
    
    return { success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}
