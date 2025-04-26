import { createElement, ReactNode } from 'react'
import { cn } from '~/lib/utils'

export const Text = ({
  children,
  size,
  level,
  className
}: {
  children: ReactNode
  size: 'Header' | 'Subheader' | 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'P'
  level?: 'primary' | 'secondary' | 'tertiary' | 'disabled'
  className?: string
}) => {
  const levelClass = level
    ? {
        primary: 'text-foreground',
        secondary: 'text-muted-foreground',
        tertiary: 'text-muted-foreground/70',
        disabled: 'text-muted-foreground/40'
      }[level]
    : ''

  const sizeClass = {
    Header: 'text-3xl',
    Subheader: 'text-lg',
    H1: 'text-5xl',
    H2: 'text-4xl',
    H3: 'text-3xl',
    H4: 'text-2xl',
    H5: 'text-xl',
    H6: 'text-lg',
    P: 'text-base'
  }[size]

  const weightClass = {
    Header: 'font-[500]',
    Subheader: 'font-normal',
    H1: 'font-[500]',
    H2: 'font-[500]',
    H3: 'font-[500]',
    H4: 'font-normal',
    H5: 'font-normal',
    H6: 'font-normal',
    P: 'font-normal'
  }[size]

  // Map PascalCase size values to lowercase HTML element tags
  const tagMapping = {
    Header: 'h1',
    Subheader: 'h2',
    H1: 'h1',
    H2: 'h2',
    H3: 'h3',
    H4: 'h4',
    H5: 'h5',
    H6: 'h6',
    P: 'p'
  }

  const elementTag = tagMapping[size]
  return createElement(elementTag, { className: cn(sizeClass, weightClass, levelClass, className) }, children)
}
