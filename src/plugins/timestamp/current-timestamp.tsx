import React, { useState, useEffect } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { TimeUnit } from "./typed"
import { Clock } from "lucide-react"
import { useCurrentTimestamp } from "@/hooks/use-current-timestamp";
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';

export const CurrentTimestamp: React.FC = () => {
  const [unit, setUnit] = useState<TimeUnit>("ms")
  const timestamp = useCurrentTimestamp<TimeUnit>(unit)

  const onCopy = async () => {
    // await navigator.clipboard.writeText(timestamp.toString())
    await writeText(timestamp.toString())
    toast("✅ 已复制时间戳")
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        当前时间戳
      </h3>
      <ToggleGroup variant="outline" type="single" defaultValue={unit} onValueChange={(v) => setUnit(v as TimeUnit)}>
        <ToggleGroupItem value="s" className="border-r-0 rounded-r-none shadow-none">秒</ToggleGroupItem>
        <ToggleGroupItem value="ms" className="border-l-0 rounded-l-none shadow-none">毫秒</ToggleGroupItem>
      </ToggleGroup>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={timestamp}
          readOnly
          className="border p-2 rounded flex-1 font-mono text-sm"
        />
        <Button onClick={onCopy}>复制</Button>
      </div>
    </div>
  )
}
