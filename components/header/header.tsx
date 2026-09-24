import { getNavigation } from "@/lib/backend-storefront"
import { HeaderShell, type HeaderProps } from "./header-shell"

/**
 * Storefront header (server component). Fetches the cached navigation
 * payload — categories, collections, spotlight, trending, promotion — so the
 * menus render fully populated in the initial HTML, with no client-side
 * loading flash and nothing for crawlers to miss.
 */
export async function Header(props: HeaderProps) {
  const navigation = await getNavigation()
  return <HeaderShell navigation={navigation} {...props} />
}
