import * as React from "react"

import { cn } from "@/lib/utils"

function Avatar({ className, ...props }) {
  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, onError, onLoad, style, src, ...props }) {
  const [loaded, setLoaded] = React.useState(false)
  // Reset saat ganti foto (ganti user) agar foto baru tidak dianggap sudah loaded
  // dan fallback tidak tertinggal menggantikan foto.
  React.useEffect(() => {
    setLoaded(false)
  }, [src])
  return (
    <img
      data-slot="avatar-image"
      data-loaded={loaded ? 'true' : 'false'}
      src={src}
      className={cn('aspect-square size-full object-cover', !loaded && 'hidden', className)}
      style={style}
      onLoad={(e) => {
        setLoaded(true)
        onLoad?.(e)
      }}
      onError={(e) => {
        setLoaded(false)
        onError?.(e)
      }}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        'bg-muted absolute inset-0 flex size-full items-center justify-center rounded-full',
        // Sembunyikan inisial begitu foto (AvatarImage) berhasil dimuat.
        // AvatarImage yang loaded merender <img> tepat sebelum fallback ini,
        // sehingga sibling selector ini menyembunyikan fallback tersebut.
        '[img[data-loaded="true"]+&]:hidden',
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
