import { cn } from '~/lib/utils'

export const LinkButton = ({ children, active = false }: { children: React.ReactNode; active?: boolean }) => {
  const className = active
    ? 'text-sm text-primary font-bold justify-items-start bg-subtle-sm py-2 px-4 rounded-md hover:bg-subtle-md'
    : 'text-sm text-muted-foreground justify-items-start py-2 px-4 rounded-md hover:bg-subtle-md'
  return <button className={cn('w-full text-left', className)}>{children}</button>
}
