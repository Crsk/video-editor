import { ReactNode } from 'react'

export type EventHandler<T> = (event: T) => void

export type EventRegistry<T> = {
  handlers: EventHandler<T>[]
  register: (handler: EventHandler<T>) => () => void
  notify: (event: T) => void
}

export type EventsProviderProps = {
  children: ReactNode
}
