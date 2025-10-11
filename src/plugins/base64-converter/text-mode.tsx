import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"
import { Copy, Download, RefreshCcw, Trash } from "lucide-react"
import React, { useState } from "react"

const TextMode: React.FC = () => {
	const [encodeText, setEncodeText] = useState("")
	const [decodeText, setDecodeText] = useState("")
	const [outputText, setOutputText] = useState("")
	const [mode, setMode] = useState<"encode" | "decode">("encode")

	// 编码/解码逻辑
	const onConvert = () => {
		try {
			if (mode === "encode") {
				const encoded = btoa(unescape(encodeURIComponent(encodeText)))
				setOutputText(encoded)
			} else {
				const decoded = decodeURIComponent(escape(atob(decodeText)))
				setOutputText(decoded)
			}
		} catch (err) {
			setOutputText("❌ 无法转换：请检查输入内容是否正确！")
		}
	}

	const onCopy = async () => {
		if (!outputText) return
		// await navigator.clipboard.writeText(outputText)
		await writeText(outputText)
		toast("✅ 已复制！")
	}

	const onDownload = () => {
		if (!outputText) return
		const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `text-${mode}.txt`
		a.click()
		URL.revokeObjectURL(url)
	}

	const onClear = () => {
		setEncodeText("")
		setDecodeText("")
		setOutputText("")
	}

	return (
		<div className="bg-white rounded-xl p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),_0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-in-out">
			<h2 className="text-xl font-semibold mb-4 flex items-center">
				<i className="fa fa-exchange text-primary mr-2" aria-hidden="true"></i>
				文本 ↔ Base64 转换工具
			</h2>

			{/* 模式切换 */}
			<div className="flex items-center mb-4">
				<ToggleGroup
					variant="outline"
					defaultValue="encode"
					type="single"
					onValueChange={(value) => setMode(value as "encode" | "decode")}
				>
					<ToggleGroupItem value="encode" aria-label="encode" className="border-r-0 rounded-r-none shadow-none">
						文本 → Base64
					</ToggleGroupItem>
					<ToggleGroupItem value="decode" aria-label="decode" className="border-l-0 rounded-l-none shadow-none">
						Base64 → 文本
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			{/* 输入区域 */}
			<Textarea
				id="input-textarea"
				className="w-full h-40 p-3 font-mono text-sm"
				placeholder={mode === "encode" ? "请输入要编码的文本..." : "请输入要解码的Base64文本..."}
				value={mode === "encode" ? encodeText : decodeText}
				rows={6}
				onChange={(e) => mode === "encode" ? setEncodeText(e.target.value) : setDecodeText(e.target.value)}
			></Textarea>

			{/* 操作按钮 */}
			<div className="flex flex-wrap gap-2 mt-4">
				<Button variant="secondary" size="lg"
					onClick={onConvert}
					className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
				>
					<RefreshCcw className="mr-2" />
					转换
				</Button>
				<Button variant="secondary" size="lg"
					onClick={onCopy}
					className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
				>
					<Copy className="mr-2" />
					复制结果
				</Button>
				<Button variant="secondary" size="lg"
					onClick={onDownload}
					className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
				>
					<Download className="mr-2" />
					下载
				</Button>
				<Button variant="secondary" size="lg"
					onClick={onClear}
					className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
				>
					<Trash className="mr-2" />
					清空
				</Button>
			</div>

			{/* 输出区域 */}
			<div className="mt-6">
				<h3 className="text-lg font-medium mb-2 flex items-center">
					<i className="fa fa-code text-primary mr-2" aria-hidden="true"></i>
					转换结果
				</h3>
				<pre className="max-w-full bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-[300px] whitespace-pre-wrap break-all min-w-full text-xs md:text-sm font-mono">
					{outputText || "（暂无内容）"}
				</pre>
			</div>
		</div>
	)
}

export default TextMode
