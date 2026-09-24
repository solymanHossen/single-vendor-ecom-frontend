interface ProductDescriptionProps {
  description: string
}

/**
 * Renders plain-text descriptions with light structure: blank lines separate
 * paragraphs, "•"/"-" lines become a list, and a short standalone line
 * directly before a list becomes its heading.
 */
export function ProductDescription({ description }: ProductDescriptionProps) {
  const blocks = description
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
      {blocks.map((block, index) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
        const bullets = lines.filter((line) => /^[•\-*]\s+/.test(line))

        if (bullets.length > 0) {
          const heading =
            lines[0] && !/^[•\-*]\s+/.test(lines[0]) ? lines[0] : null
          return (
            <div key={index} className="space-y-2">
              {heading && (
                <h3 className="text-sm font-semibold text-foreground">
                  {heading}
                </h3>
              )}
              <ul className="grid gap-2 sm:grid-cols-2">
                {bullets.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <span className="text-foreground/90">
                      {line.replace(/^[•\-*]\s+/, "")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        }

        return <p key={index}>{lines.join(" ")}</p>
      })}
    </div>
  )
}
