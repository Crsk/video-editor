import { useTheme } from '~/providers/theme-provider'
import { Button } from '~/components/ui/button'
import { SunIcon, MoonIcon } from 'lucide-react'

export const ThemeToggle = () => {
  const { toggleDarkMode, darkMode } = useTheme()

  return (
    <Button variant="ghost" className="rounded-xl" onClick={() => toggleDarkMode()}>
      {darkMode ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
