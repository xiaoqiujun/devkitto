import useMonacoEditor from "@/hooks/use-monaco-editor"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable"
import TreeCard from "./tree-card"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { JsonTree, transformJsonLineMap } from "@/plugins/json-editor/transform"

export interface EditorHandle {
	/**
	 * 撤销上一步操作
	 * @returns
	 */
	undo?: () => void

	/**
	 * 重做上一步操作
	 * @returns
	 */
	redo?: () => void
	/**
	 * 跳转至指定行号和列号
	 * @param lineNumber 行号（从1开始）
	 * @param column 列号（从1开始）
	 * @returns
	 */
	positionAt?: (lineNumber: number, column: number) => void

	/**
	 * 获取指定行号的内容
	 * @param lineNumber 行号（从1开始）
	 * @returns 行内容
	 */
	getLineContent?: (lineNumber: number) => string

	/**
	 * 选择指定范围的文本
	 * @param startLineNumber 开始行号（从1开始）
	 * @param startColumn 开始列号（从1开始）
	 * @param endLineNumber 结束行号（从1开始）
	 * @param endColumn 结束列号（从1开始）
	 * @returns
	 */
	selectRange?: (startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) => void

	/**
	 * 获取当前选中的文本
	 * @returns 选中的文本
	 */
	getSelectedText?: () => string

	/**
	 * 在指定范围插入文本
	 * @param startLineNumber 开始行号（从1开始）
	 * @param startColumn 开始列号（从1开始）
	 * @param endLineNumber 结束行号（从1开始）
	 * @param endColumn 结束列号（从1开始）
	 * @param text 要插入的文本
	 * @returns
	 */
	insertTextInRange?: (
		startLineNumber: number,
		startColumn: number,
		endLineNumber: number,
		endColumn: number,
		text: string
	) => void

	/**
	 * 设置光标位置
	 * @param lineNumber 行号（从1开始）
	 * @param column 列号（从1开始）
	 * @returns
	 */
	setCursorPosition?: (lineNumber: number, column: number) => void

	/**
	 * 获取当前光标位置
	 * @returns 当前光标位置（行号和列号）
	 */
	getCursorPosition?: () => { lineNumber: number; column: number }

	/**
	 * 设置编辑器内容
	 * @param content 要设置的内容
	 * @returns
	 */
	setEditorContent?: (content: string) => void

	/**
	 * 获取当前编辑器内容
	 * @returns 当前编辑器内容
	 */
	getEditorContent?: () => string

	/**
	 * 清除编辑器内容
	 * @returns
	 */
	clearEditorContent?: () => void

	/**
	 * 设置编辑器只读模式
	 * @param readOnly 是否只读
	 * @returns
	 */
	setEditorReadOnly?: (readOnly: boolean) => void

	/**
	 * 聚焦编辑器
	 * @returns
	 */
	focusEditor?: () => void

	/**
	 * 失焦编辑器
	 * @returns
	 */
	blurEditor?: () => void

	/**
	 * 查找并替换文本
	 * @param findText 要查找的文本
	 * @param replaceText 要替换的文本
	 * @returns
	 */
	findAndReplace?: (findText: string, replaceText: string) => void

	/**
	 * 格式化代码
	 * @returns
	 */
	formatCode?: () => void

	/**
	 * 折叠指定范围的代码
	 * @param startLineNumber 开始行号（从1开始）
	 * @param startColumn 开始列号（从1开始）
	 * @param endLineNumber 结束行号（从1开始）
	 * @param endColumn 结束列号（从1开始）
	 * @returns
	 */
	foldRange?: (startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) => void

	/**
	 * 展开指定范围的代码
	 * @param startLineNumber 开始行号（从1开始）
	 * @param startColumn 开始列号（从1开始）
	 * @param endLineNumber 结束行号（从1开始）
	 * @param endColumn 结束列号（从1开始）
	 * @returns
	 */
	unfoldRange?: (startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) => void

	/**
	 * 折叠所有代码
	 * @returns
	 */
	foldAll?: () => void

	/**
	 * 展开所有代码
	 * @returns
	 */
	unfoldAll?: () => void

	/**
	 * 注释选中的代码
	 * @returns
	 */
	commentSelection?: () => void

	/**
	 * 复制选中的代码
	 * @returns
	 */
	duplicateLine?: () => void

	/**
	 * 删除选中的代码
	 * @returns
	 */
	deleteLine?: () => void

	/**
	 * 当编辑器内容改变时调用
	 * @param content 新的编辑器内容
	 * @returns
	 */
	onContentChange?: (content: string) => void

	/**
	 * 当光标位置改变时调用
	 * @param position 新的光标位置（行号和列号）
	 * @returns
	 */
	onCursorChange?: (position: { lineNumber: number; column: number }) => void
}
export interface EditorProps extends EditorHandle {
	leftPanel?: React.ReactNode
	rightPanel?: React.ReactNode
	language?: "json" | "yaml" | "xml" | "csv" // ✅ 新增显式语言类型
	value?: string
}

const Editor = ({ leftPanel, rightPanel, language, value, onContentChange }: EditorProps) => {
	const virtualizerRef = useRef(null)

	const { editorRef, monacoInstance, linesContent, monaco } = useMonacoEditor({
		value,
		language,
		onValueChange: (val) => {
			onContentChange?.(val)
		},
	})

	const {nodes, tree} = useMemo(() => {
		return transformJsonLineMap(linesContent)
	}, [linesContent])

	const [treeData, setTreeData] = useState(tree)

	const rowVirtualizer = useVirtualizer({
		count: nodes.length,
		getScrollElement: () => virtualizerRef.current,
		estimateSize: () => 56,
	})
	console.log(nodes,tree,rowVirtualizer.getVirtualItems())

	useEffect(() => {
		setTreeData(tree)
	}, [tree])

	const onPosition = (startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) => {
		console.log("跳转", startColumn, endColumn)		
		const editor = monacoInstance.current
		if (!editor) return
		const model = editor.getModel()
		if (!model) return
		const lineLength = model.getLineLength(endLineNumber)
		const position = new monaco.Position(endLineNumber, endColumn)
		const range = new monaco.Range(
			startLineNumber, // 起始行
			startColumn, // 起始列
			endLineNumber, // 结束行
			endColumn + 1 // 结束列（+1 确保选中整行，包括换行符）	
		)
		editor.revealPosition(position)
		editor.setPosition(position)
		editor.setSelection(range)
		// editor.focus()
	}

	const onValueChange = (value?: any) => {}

	const onOpenChange = useCallback((item: JsonTree, open: boolean) => {
		console.log("展开", item.id, open)
		const toggle = (tree: JsonTree[], id: string, expanded: boolean): [JsonTree[], boolean] => {
			let modified = false

			const newTree = tree.map((node) => {
				if (node.id === id) {
					modified = true
					return { ...node, expanded }
				} else if (node.children && node.children.length) {
					const [newChildren, changed] = toggle(node.children, id, expanded)
					if (changed) {
						modified = true
						return { ...node, children: newChildren }
					}
				}
				return node
			})

			return [newTree, modified]
		}
		setTreeData((prev) => {
			const [newTree] = toggle(prev, item.id, open)
			return newTree
		})
	}, [])

	const onTreeInputChange = useCallback((type: string, e: React.ChangeEvent<HTMLInputElement | HTMLButtonElement>, item: JsonTree) => {
		console.log(type, e, item)
	}, [])

	return (
		<ResizablePanelGroup direction="horizontal" className="min-w-full w-full rounded-lg border">
			<ResizablePanel defaultSize={20} minSize={1}>
				<div className="w-full h-full flex flex-col">
					<div ref={editorRef} className="flex-1" />
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50}>
				<div className="relative h-full">
					<div className="absolute inset-0 overflow-auto p-3" ref={virtualizerRef}>
						<TreeCard
							tree={treeData}
							onPosition={onPosition}
							onValueChange={onValueChange}
							onOpenChange={onOpenChange}
							onTreeInputChange={onTreeInputChange}
						/>
					</div>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	)
}

export default Editor
