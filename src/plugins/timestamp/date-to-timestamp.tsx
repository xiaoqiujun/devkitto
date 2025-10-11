import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TIME_ZONES, TimeUnit } from "./typed"
import { Watch } from "lucide-react"
import { DateTime } from "luxon"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"

export const DateToTimestamp: React.FC = () => {
	const [dateStr, setDateStr] = useState<string>("")
	const [unit, setUnit] = useState<TimeUnit>("ms")
	const [timeZone, setTimeZone] = useState<string>("Asia/Shanghai")
	const [result, setResult] = useState<string>("")

	const onConvert = () => {
		try {
      if (!dateStr) throw new Error("请输入日期时间")
      // 使用 Luxon 解析日期字符串，并指定时区
      const dt = DateTime.fromFormat(dateStr, "yyyy-MM-dd HH:mm:ss", { zone: timeZone })
      if (!dt.isValid) throw new Error("无效日期格式")

      const ts = unit === "s" ? Math.floor(dt.toMillis() / 1000) : dt.toMillis()
      setResult(ts.toString())
    } catch (err: any) {
      toast(`❌ ${err.message || "无效日期时间"}`)
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
				<Watch className="w-5 h-5" />
				日期时间 → 时间戳
			</h3>

			<div className="flex gap-2 mb-2 items-center justify-center">
				<Input
					placeholder="输入日期时间，例如 2025-10-05 15:30:00"
					value={dateStr}
					onChange={(e) => setDateStr(e.target.value)}
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
