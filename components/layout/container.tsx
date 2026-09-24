import { cn } from "@/lib/utils"

type ContainerProps<T extends React.ElementType> = {
  as?: T
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">

/** Site-wide content width + gutters (see the `page-container` utility in globals.css). */
export function Container<T extends React.ElementType = "div">({
  as,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? "div"
  return (
    <Component className={cn("page-container", className)} {...props}>
      {children}
    </Component>
  )
}
