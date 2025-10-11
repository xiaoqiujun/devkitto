import { toast } from "@/components/ui/sonner"
import { Copy, Search } from "lucide-react"
import { HTML_CHARS } from "./typed"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"

export const HTMLSpecialChars: React.FC = () => {
	const [search, setSearch] = useState("")

	const filteredChars = useMemo(() => {
		if (!search) return HTML_CHARS
		const s = search.toLowerCase()
		return HTML_CHARS.filter(
			(item) =>
				item.char.includes(s) ||
				item.entity.toLowerCase().includes(s) ||
				item.description.toLowerCase().includes(s)
		)
	}, [search])

	const onCopy = async (text: string, label: string) => {
		// await navigator.clipboard.writeText(text)
    await writeText(text)
		toast("✅ 已复制")
	}

	return (
		<div className="p-4 bg-white rounded-lg shadow-md">
			<div className="flex items-center gap-2 mb-4">
				<h2 className="font-semibold text-xl">HTML 实体表</h2>
			</div>

			{/* 搜索框 */}
			<div className="flex items-center mb-4 gap-2">
				<Search className="w-5 h-5 text-gray-500" />
				<Input
					type="text"
					placeholder="搜索字符、实体或描述..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="flex-1 border rounded p-2"
				/>
			</div>

			{/* 表格 */}
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left">
					<thead>
						<tr className="bg-gray-100">
							<th className="p-2 border">字符</th>
							<th className="p-2 border">实体</th>
							<th className="p-2 border">描述</th>
						</tr>
					</thead>
					<tbody>
						{filteredChars.map((item, idx) => (
							<tr key={idx} className="hover:bg-gray-50 transition">
								<td className="p-2 border font-mono text-lg">
									<div className="flex items-center justify-between">
                    <Label className="bg-muted p-1 rounded-sm">{item.char}</Label>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="p-0 w-5 h-5"
														onClick={() => onCopy(item.char, "char")}
													>
														<Copy className="w-4 h-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>复制</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</td>
								<td className="p-2 border font-mono">
									<div className="flex items-center justify-between">
                    <Label className="bg-muted p-1 rounded-sm">{item.entity}</Label>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="p-0 w-5 h-5"
														onClick={() => onCopy(item.entity, "entity")}
													>
														<Copy className="w-4 h-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>复制</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</td>
								<td className="p-2 border">{item.description}</td>
							</tr>
						))}
						{filteredChars.length === 0 && (
							<tr>
								<td colSpan={4} className="text-center p-4 text-gray-400">
									未找到匹配内容
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
