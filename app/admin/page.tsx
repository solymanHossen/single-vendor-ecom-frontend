import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminIndexPage() {
  return (
    <div className="page-container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">Manage storefront content and settings.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/hero-banners">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex-row items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ImageIcon className="size-5" />
              </div>
              <div>
                <CardTitle>Hero Banners</CardTitle>
                <CardDescription>Manage the homepage carousel and side banners.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
