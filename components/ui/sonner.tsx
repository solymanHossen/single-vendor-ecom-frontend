"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

// Status is carried by icon + title text, never colour alone.
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      closeButton
      duration={4500}
      gap={12}
      visibleToasts={4}
      offset={{ top: 24, right: 24 }}
      mobileOffset={{ top: 12, left: 12, right: 12 }}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="text-primary" />,
        info: <InfoIcon className="text-sky-600 dark:text-sky-400" />,
        warning: (
          <TriangleAlertIcon className="text-amber-600 dark:text-amber-400" />
        ),
        error: <OctagonXIcon className="text-destructive" />,
        loading: (
          <Loader2Icon className="animate-spin text-muted-foreground" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border":
            "color-mix(in oklab, var(--border) 70%, transparent)",
          "--border-radius": "16px",
          "--width": "420px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast font-sans !items-start !gap-4 !px-5 !py-[18px] !pr-12 !shadow-[0_12px_32px_-8px_rgb(0_0_0/0.16),0_2px_6px_-2px_rgb(0_0_0/0.08)] dark:!shadow-[0_12px_32px_-8px_rgb(0_0_0/0.5)]",
          icon: "!m-0 !mt-px !size-[22px] !shrink-0 [&_svg]:!size-[22px]",
          content: "!gap-1",
          title: "!text-base !font-semibold !leading-6 !tracking-[-0.01em]",
          description:
            "!text-[14.5px] !leading-[1.45] !text-muted-foreground",
          actionButton:
            "!mt-0.5 !h-9 !rounded-lg !bg-primary !px-3.5 !text-sm !font-semibold !text-primary-foreground transition-opacity hover:!opacity-90",
          cancelButton: "!mt-0.5 !h-9 !rounded-lg !px-3.5 !text-sm",
          // Centred on the title row (py 18px + half of the 24px line − half
          // of the 28px button = 16px). Sonner offsets it with `transform`,
          // which Tailwind's translate-* utilities don't reset.
          closeButton:
            "!left-auto !right-3.5 !top-4 !size-7 !transform-none !rounded-full !border-0 !bg-transparent !text-muted-foreground/70 transition-colors duration-150 hover:!bg-muted hover:!text-foreground focus-visible:!shadow-none focus-visible:!outline-2 focus-visible:!outline-ring/50 [&_svg]:!size-4 [&_svg]:!stroke-[2.25]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
