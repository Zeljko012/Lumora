import { useEffect, useState } from 'react'

const QUERY = '(min-width: 1024px)'

/** true na širokom ekranu (računar): tada aplikacija prikazuje meni sa strane i raspored u kolonama. */
export function useIsDesktop(): boolean {
  const [on, setOn] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false))
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const h = () => setOn(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return on
}
