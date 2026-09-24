import { preload } from "react-dom"
import { getImageProps } from "next/image"
import { isOptimizableImage } from "./images"

/**
 * Warms the exact optimized file an upcoming <Image fill sizes=…> will
 * request, so it renders instantly instead of loading in view.
 */
export function preloadImage(url: string, sizes: string): void {
  if (!isOptimizableImage(url)) {
    preload(url, { as: "image" })
    return
  }
  const { props } = getImageProps({ src: url, alt: "", fill: true, sizes })
  preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
  })
}
