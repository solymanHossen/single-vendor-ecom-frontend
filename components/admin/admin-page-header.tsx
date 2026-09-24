interface AdminPageHeaderProps {
  title: string
  description: string
  actions?: React.ReactNode
}

/** Shared page heading for every admin screen. */
export function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          {description}
        </p>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
