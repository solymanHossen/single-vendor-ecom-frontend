import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasRole, SUPER_ADMIN_ROLES } from '@/auth.config';
import { getAllHeroBannersAdmin } from '@/lib/backend-hero';
import { HeroBannerManager } from '@/components/admin/hero-banner-manager';

export default async function HeroBannersAdminPage() {
  const session = await auth();
  if (!session?.accessToken) redirect('/login');
  // Layout already gates on ADMIN_ROLES — this screen is stricter, so a
  // plain ADMIN gets bounced here instead of seeing a 403 from every action.
  if (!hasRole(session.user.role, SUPER_ADMIN_ROLES)) redirect('/dashboard');

  const banners = await getAllHeroBannersAdmin(session.accessToken);

  return (
    <div className="page-container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Hero Banners</h1>
        <p className="text-sm text-muted-foreground">
          Manage the homepage carousel slides and side banner cards.
        </p>
      </div>

      <HeroBannerManager banners={banners} />
    </div>
  );
}
