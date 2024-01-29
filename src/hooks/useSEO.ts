import { useEffect } from 'react'

export const useSEO = ({ title }: { title: string }) => {
  useEffect(() => {
    document.title = title
  }, [title])
}
