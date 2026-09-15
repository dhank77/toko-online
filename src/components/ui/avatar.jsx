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

function AvatarImage({ className, onError, ...props }) {
  const [hasError, setHasError] = React.useState(false)

  if (hasError) return null

  return (
    <img
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      onError={(e) => {
        setHasError(true)
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
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
