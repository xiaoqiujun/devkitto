import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TIME_ZONES, TimeUnit } from "./typed"
import { Calendar } from "lucide-react"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"


export const TimestampToDate: React.FC = () => {
  const [timestamp, setTimestamp] = useState<string>("")
  const [unit, setUnit] = useState<TimeUnit>("ms")
  const [timeZone, setTimeZone] = useState<string>("Asia/Shanghai")
  const [result, setResult] = useState<string>("")

  const onConvert = () => {
    try {
      const ts = unit === "s" ? parseInt(timestamp) * 1000 : parseInt(timestamp)
      const date = new Date(ts)
      const str = date.toLocaleString("zh-CN", { timeZone })
      setResult(str)
    } catch (e) {
      toast("❌ 无效时间戳")
    }
  }

  const onCopy = async () => {
    if (!result) return
    await writeText(result)
    toast("✅ 已复制")
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        时间戳 → 日期时间
      </h3>

      <div className="flex gap-2 mb-2 items-center justify-center">
        <Input
          placeholder="输入时间戳"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        />

        <Select value={unit} defaultValue="ms" onValueChange={(v) => setUnit(v as TimeUnit)}>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="选择时间单位" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem key={"ms"} value={"ms"}>
							毫秒
						</SelectItem>
						<SelectItem key={"s"} value={"s"}>
							秒
						</SelectItem>
					</SelectContent>
				</Select>
        {/* 选择时区 */}
        <Select value={timeZone} onValueChange={(v) => setTimeZone(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="选择时区" />
          </SelectTrigger>
          <SelectContent>
            {TIME_ZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 mb-2">
        <Button onClick={onConvert}>转换</Button>
        <Button onClick={onCopy}>复制结果</Button>
      </div>

      <div className="mt-2 p-2 bg-gray-100 rounded font-mono">{result || "（暂无内容）"}</div>
    </div>
  )
}
