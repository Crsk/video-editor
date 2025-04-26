import { createContext, useContext, useEffect } from 'react'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const darkModeAtom = atomWithStorage('darkMode', false)

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  darkMode: boolean
  toggleDarkMode: () => void
}

const initialState: ThemeProviderState = {
  darkMode: false,
  toggleDarkMode: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom)
  const toggleDarkMode = () => setDarkMode(!darkMode)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (darkMode) root.classList.add('dark')
    else root.classList.add('light')
  }, [darkMode])

  const value = { darkMode, toggleDarkMode }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
