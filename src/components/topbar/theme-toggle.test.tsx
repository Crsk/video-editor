import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '../topbar/theme-toggle'
import * as ThemeProvider from '~/providers/theme-provider'

vi.mock('~/providers/theme-provider', async () => {
  const actual = await vi.importActual('~/providers/theme-provider')
  return {
    ...actual,
    useTheme: vi.fn()
  }
})

vi.mock('lucide-react', async () => {
  return {
    SunIcon: () => <div data-testid="sun-icon">Sun</div>,
    MoonIcon: () => <div data-testid="moon-icon">Moon</div>
  }
})

describe('ThemeToggle', () => {
  it('should render the moon icon when dark mode is false', () => {
    const mockToggle = vi.fn()
    vi.spyOn(ThemeProvider, 'useTheme').mockReturnValue({
      darkMode: false,
      toggleDarkMode: mockToggle
    })

    render(<ThemeToggle />)

    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument()
  })

  it('should render the sun icon when dark mode is true', () => {
    const mockToggle = vi.fn()
    vi.spyOn(ThemeProvider, 'useTheme').mockReturnValue({
      darkMode: true,
      toggleDarkMode: mockToggle
    })

    render(<ThemeToggle />)

    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument()
  })

  it('should call toggleDarkMode when the button is clicked', async () => {
    const mockToggle = vi.fn()
    vi.spyOn(ThemeProvider, 'useTheme').mockReturnValue({
      darkMode: false,
      toggleDarkMode: mockToggle
    })
    const user = userEvent.setup()

    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockToggle).toHaveBeenCalledTimes(1)
  })
})
