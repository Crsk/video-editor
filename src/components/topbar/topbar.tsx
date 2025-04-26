import { ThemeToggle } from '~/components/topbar/theme-toggle'

export const Topbar = () => {
  return (
    <div className="absolute flex flex-row gap-4 justify-between px-0 md:px-4 lg:px-8 py-3 items-center w-full border-b-1 border-border z-10 bg-background">
      <div className="w-full flex flex-row justify-end">
        <ThemeToggle />
      </div>
    </div>
  )
}
