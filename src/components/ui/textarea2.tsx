import * as React from 'react'

import { cn } from '~/lib/utils'

const overrideDefault = cn(
  'focus-visible:border-ring/0 bg-subtle-xl',
  'focus-visible:ring-[0px] focus-visible:border-primary/0 border-primary/0 focus-visible:ring-ring/0 py-7 px-6 rounded-3xl',
  ''
)

function Textarea2({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        overrideDefault,
        className
      )}
      {...props}
    />
  )
}

export { Textarea2 }
