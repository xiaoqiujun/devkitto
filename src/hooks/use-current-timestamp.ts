import { TimeUnit } from "@/plugins/timestamp/typed"
import { useEffect, useState } from "react"

export const useCurrentTimestamp = <T = any>(unit: T) => {
  const [timestamp, setTimestamp] = useState<number>(
    unit === "s" ? Math.floor(Date.now() / 1000) : Date.now()
  )

  useEffect(() => {
    const intervalMs = unit === "s" ? 1000 : 800
    const id = setInterval(() => {
      setTimestamp(unit === "s" ? Math.floor(Date.now() / 1000) : Date.now())
    }, intervalMs)

    return () => clearInterval(id)
  }, [unit])

  return timestamp
}
