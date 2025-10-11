import React, { useEffect, useRef, useState } from "react"
import * as monaco from "monaco-editor"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuShortcut,
	ContextMenuTrigger,
} from "./ui/context-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Command, CommandInput, CommandItem, CommandList } from "./ui/command"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface MonacoEditorProps {
	value: any
	language?: "json" | "yaml" | "xml" | "csv" // ✅ 新增显式语言类型
	readOnly?: boolean
	theme?: "vs-dark" | "light"
	onChange?: (value: string) => void
	onLinesContentChange?: (linesContent: string[]) => void
}

/**
 * 🎯 通用结构化文本编辑器（Monaco 封装）
 * 支持 JSON / YAML / XML / CSV 等语言，可选择显式语言属性。
 * 具备 CSV 自动预览、YAML 校验、格式化快捷键等功能。
 *
 * - 不依赖 @monaco-editor/react，完全原生封装。
 * - 通过 props.language 显式指定语言，默认 json。
 * - CSV 自动预览表格。
 * - YAML 基础结构校验（不依赖 monaco-yaml）。
 */
const MonacoEditor: React.FC<MonacoEditorProps> = ({
	value,
	language = "json", // ✅ 默认语言为 JSON
	readOnly = false,
	theme = "vs-light",
	onChange,
	onLinesContentChange,
}) => {
	const editorRef = useRef<HTMLDivElement | null>(null)
	const monacoInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
	const [contextPos, setContextPos] = useState<{ x: number; y: number } | null>(null)
	const [csvData, setCsvData] = useState<string[][] | null>(null)
	const [open, setOpen] = useState(false)
	const [findText, setFindText] = useState("")
	const [replaceText, setReplaceText] = useState("")
	const [linesContent, setLinesContent] = useState<string[]>([])

	/**
	 * 🧩 初始化 Monaco 编辑器
	 */
	useEffect(() => {
		if (!editorRef.current) return

		monacoInstance.current = monaco.editor.create(editorRef.current, {
			value: value || "",
			language, // ✅ 使用显式传入的语言
			readOnly,
			theme,
			automaticLayout: true,
			minimap: { enabled: false },
			// contextmenu: false, // 关闭右键菜单
			quickSuggestions: false, // 关闭自动建议弹窗
			mouseWheelZoom: false, // 禁用 Ctrl+滚轮缩放
			disableLayerHinting: true,
		})

		// monacoInstance.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
		// 	setOpen(true)
		// })

		const model = monacoInstance.current.getModel()
		setLinesContent(model.getLinesContent())

		// ✅ 内容变更监听
		const changeListener = model?.onDidChangeContent(({ changes }) => {
			const val = model.getValue()
			const range = changes[0].range
			onChange?.(val)

			if (language === "csv") parseCSV(val)
			if (language === "yaml") validateYAML(val)
		})
		monaco.editor.onDidChangeMarkers(([uri]) => {
			const markers = monaco.editor.getModelMarkers({ resource: uri })
			if(!markers.length) {
				setLinesContent(model.getLinesContent())
			}
		})

		// ✅ 注册格式化快捷键
		monacoInstance.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			formatContent()
		})

		// 初始化时根据语言处理
		if (language === "csv") parseCSV(value)
		if (language === "yaml") validateYAML(value)

		return () => {
			changeListener?.dispose()
			monacoInstance.current?.dispose()
		}
	}, [])

	/**
	 * 🧹 当外部 props.value 改变时更新编辑器
	 */
	useEffect(() => {
		if (!monacoInstance.current) return
		const model = monacoInstance.current.getModel()
		if (value !== model?.getValue()) model?.setValue(value)
	}, [value])

	useEffect(() => {
		if (!monacoInstance.current) return
		onLinesContentChange?.(linesContent)
	}, [linesContent])

	/**
	 * ✨ 格式化内容（仅 JSON / XML）
	 */
	const formatContent = () => {
		if (!monacoInstance.current) return
		const editor = monacoInstance.current
		const text = editor.getValue()

		try {
			let formatted = text
			if (language === "json") {
				formatted = JSON.stringify(JSON.parse(text), null, 2)
			} else if (language === "xml") {
				formatted = formatXML(text)
			}
			editor.setValue(formatted)
		} catch (e) {
			console.warn("Format failed:", e)
		}
	}

	/**
	 * 🧾 CSV 解析与表格预览
	 */
	const parseCSV = (csvText: string) => {
		const rows = csvText
			.trim()
			.split(/\r?\n/)
			.map((row) => row.split(","))
		setCsvData(rows)
	}

	/**
	 * ✅ YAML 简单结构校验（不依赖 monaco-yaml）
	 */
	const validateYAML = (yamlText: string) => {
		const errors: string[] = []
		const lines = yamlText.split(/\n/)
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (line.trim() && !/^\s*[^:]+\s*:.+$/.test(line)) {
				errors.push(`第 ${i + 1} 行可能缺少 ':' 或格式错误`)
			}
		}

		const model = monacoInstance.current?.getModel()
		if (!model) return
		const markers: monaco.editor.IMarkerData[] = errors.map((msg, i) => ({
			severity: monaco.MarkerSeverity.Warning,
			message: msg,
			startLineNumber: i + 1,
			endLineNumber: i + 1,
			startColumn: 1,
			endColumn: 1,
		}))

		monaco.editor.setModelMarkers(model, "yaml", markers)
	}
	const handleFind = () => {
		const editor = monacoInstance.current
		if (!editor || !findText) return

		const model = editor.getModel()
		if (!model) return

		const matches = model.findMatches(findText, true, false, false, null, true)
		if (matches.length) {
			editor.setSelection(matches[0].range)
			editor.revealRangeInCenter(matches[0].range)
		}
	}

	const handleReplace = () => {
		const editor = monacoInstance.current
		if (!editor) return
		const model = editor.getModel()
		if (!model) return

		const selection = editor.getSelection()
		if (!selection) return

		model.pushEditOperations([], [{ range: selection, text: replaceText }], () => null)
	}

	/**
	 * 🧩 XML 格式化函数
	 */
	const formatXML = (xml: string) => {
		const PADDING = "  "
		const reg = /(>)(<)(\/*)/g
		let formatted = ""
		let pad = 0

		xml = xml.replace(reg, "$1\r\n$2$3")
		xml.split(/\r?\n/).forEach((node) => {
			let indent = 0
			if (node.match(/.+<\/.+>$/)) indent = 0
			else if (node.match(/^<\/.+/)) pad = pad - 1
			else if (node.match(/^<[^!?].*>$/)) indent = 1
			formatted += PADDING.repeat(pad) + node + "\n"
			pad += indent
		})
		return formatted.trim()
	}

	return (
		<div className="w-full h-full flex flex-col">
			{/* 编辑器区域 */}
			<div ref={editorRef} className="flex-1" />
			{/* <ContextMenu>
				<ContextMenuTrigger className="w-full h-full flex flex-col">
					<div ref={editorRef} className="flex-1" />
				</ContextMenuTrigger>
				<ContextMenuContent className="w-52">
					<ContextMenuItem inset>
						Back
						<ContextMenuShortcut>⌘[</ContextMenuShortcut>
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu> */}
			{/* 🔍 自定义查找面板（使用 shadcn Command + Dialog） */}
			{/* <Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="p-0 overflow-hidden">
					<VisuallyHidden>
						<DialogHeader>
							<DialogTitle>查找与替换</DialogTitle>
							<DialogDescription>查找与替换</DialogDescription>
						</DialogHeader>
					</VisuallyHidden>
					<Command>
						<div className="p-2 border-b bg-muted/50">
							<CommandInput placeholder="输入查找内容..." value={findText} onValueChange={setFindText} />
							<CommandInput
								placeholder="输入替换内容..."
								value={replaceText}
								onValueChange={setReplaceText}
							/>
						</div>
						<CommandList>
							<CommandItem onSelect={handleFind}>查找下一个</CommandItem>
							<CommandItem onSelect={handleReplace}>替换当前</CommandItem>
							<CommandItem onSelect={() => setOpen(false)}>关闭</CommandItem>
						</CommandList>
					</Command>
				</DialogContent>
			</Dialog> */}
			{/* CSV 预览表格 */}
			{language === "csv" && csvData && (
				<div className="overflow-auto max-h-60 mt-2 border-t border-gray-700">
					<table className="w-full text-sm text-left">
						<tbody>
							{csvData.map((row, i) => (
								<tr key={i} className="border-b border-gray-800">
									{row.map((cell, j) => (
										<td key={j} className="px-2 py-1 whitespace-nowrap">
											{cell}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

export default MonacoEditor
