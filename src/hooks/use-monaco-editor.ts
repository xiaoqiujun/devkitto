import * as monaco from "monaco-editor"
import { useEffect, useRef, useState } from "react"
export type MonacoLanguage = "json" | "yaml" | "xml" | "csv"
export interface UseMonacoEditorOption {
	value: string
	language?: MonacoLanguage // ✅ 新增显式语言类型
	readOnly?: boolean
	theme?: "vs-dark" | "light"
}
const useMonacoEditor = ({ value, language, readOnly, theme }: UseMonacoEditorOption) => {
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
		const model = monacoInstance.current.getModel()
		setLinesContent(model.getLinesContent())
		monaco.editor.onDidChangeMarkers(([uri]) => {
			const markers = monaco.editor.getModelMarkers({ resource: uri })
			if (!markers.length) {
				setLinesContent(model.getLinesContent())
			}
		})
		// ✅ 注册格式化快捷键
		monacoInstance.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			const text = monacoInstance.current?.getValue() || ""
			const formatted = formatContent(text, language)
			if (formatted) {
				monacoInstance.current?.setValue(formatted)
			}
		})
	}, [])

  return {
    editorRef,
    monacoInstance,
    linesContent,
    monaco
  }
}

/**
 * ✨ 格式化内容（仅 JSON / XML）
 */
const formatContent = (text: string, language?: MonacoLanguage) => {
	let formatted = text
	try {
		if (language === "json") {
			formatted = JSON.stringify(JSON.parse(text), null, 2)
		} else if (language === "xml") {
			formatted = formatXML(text)
		}
	} catch (e) {
		console.warn("Format failed:", e)
	}
	return formatted
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

export default useMonacoEditor
