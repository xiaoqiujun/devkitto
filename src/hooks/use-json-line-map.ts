import { useMemo } from "react"
import { hasOwn } from "funtool"

interface Position {
	startLineNumber: number
	startColumn: number
	endLineNumber: number
	endColumn: number
}
interface Range {
	key: Position
	value: Position
}
interface JsonNode {
	/**
	 * 节点唯一标识
	 */
	id: string
	/**
	 * 键名
	 */
	name: string
	/**
	 * 值
	 */
	value?: string
	/**
	 * 值类型
	 */
	valueType?: string
	/**
	 * 节点范围
	 */
	range: Range
	/**
	 * 节点块范围
	 */
	block: Position
	/**
	 * 层级深度（根为0）
	 */
	level: number
	/**
	 * 父节点ID
	 */
	parent?: string
	/**
	 * 是否有依赖（是否有子节点）
	 */
	dependencies?: boolean
	/**
	 * 是否展开
	 */
	expanded?: boolean
}
export interface JsonTree extends JsonNode {
	/**
	 * 子节点
	 */
	children?: JsonTree[]
}

export function useJsonLineMap(lines: string[]) {
	return useMemo(() => {
		const stack: JsonNode[] = []
		const nodes: JsonNode[] = []
		let idCounter = 0

		const pushNode = (node: JsonNode) => {
			nodes.push(node)
			if (stack.length > 0) node.parent = stack[stack.length - 1].id
		}

		lines.forEach((line, index) => {
			const trimmed = line.trim()
			const lineNum = index + 1
			const leadingSpaces = line.match(/^\s*/)?.[0].length ?? 1
			const range: Range = {
				key: {
					startLineNumber: lineNum,
					startColumn: leadingSpaces,
					endLineNumber: lineNum,
					endColumn: line.length,
				},
				value: {
					startLineNumber: lineNum,
					startColumn: leadingSpaces,
					endLineNumber: lineNum,
					endColumn: line.length,
				},
			}
			const block = {
				startLineNumber: lineNum,
				startColumn: leadingSpaces,
				endLineNumber: lineNum,
				endColumn: line.length,
			}
			console.log(line, ":", leadingSpaces)
			if (trimmed.startsWith("}") || trimmed.startsWith("]")) {
				const last = stack.pop()
				if (last) {
					range.value.endLineNumber = lineNum
					range.value.endColumn = line.length
					// last.endLineNumber[1] = lineNum;
					// last.endColumn[1] = line.length;
				}
				return
			}

			const match = trimmed.match(/^"([^"]+)"\s*:\s*(.*)/)
			if (!match) return

			const [, key, rest] = match
			let value = rest.replace(/,$/, "").trim()
			let valueType: string | undefined

			if (value.startsWith("{")) valueType = "object"
			else if (value.startsWith("[")) valueType = "array"
			else if (value.startsWith('"')) {
				valueType = "string"
				value = value.replace(/^"|"$/g, "")
			} else if (/^(true|false)$/.test(value)) valueType = "boolean"
			else if (value === "null") valueType = "null"
			else if (!isNaN(Number(value))) valueType = "number"

			const isContainer = valueType === "object" || valueType === "array"
			const val = isContainer ? undefined : value

			// 列坐标计算
			range.key.startColumn = line.indexOf(`"${key}"`) + 2
			range.key.endColumn = range.key.startColumn + key.length + 1
			range.value.startColumn = line.indexOf(":") + 2
			range.value.endColumn = line.length

			let blockEndLine = lineNum
			let blockEndCol = range.value.startColumn + value.length

			// 如果是对象或数组，找到闭合位置
			if (isContainer) {
				let openCount = 0
				let foundStart = false
				for (let i = index; i < lines.length; i++) {
					const l = lines[i]
					for (let j = 0; j < l.length; j++) {
						const char = l[j]
						if (!foundStart) {
							// 第一次遇到 { 或 [，记录起始
							if ((valueType === "object" && char === "{") || (valueType === "array" && char === "[")) {
								openCount = 1
								foundStart = true
							}
						} else {
							if (valueType === "object") {
								if (char === "{") openCount++
								else if (char === "}") openCount--
							} else {
								if (char === "[") openCount++
								else if (char === "]") openCount--
							}
							// 找到闭合
							if (openCount === 0) {
								blockEndLine = i + 1 // 行号从1开始
								blockEndCol = j + 1 // 列号从1开始
								break
							}
						}
					}
					if (openCount === 0) break
				}
			}else {
        // 单行值
        const valueMatch = line.slice(range.value.startColumn).match(/^(.*?)(,|\s*$)/);
        if (valueMatch) {
          blockEndCol = range.value.startColumn + valueMatch[1].length; // 包括引号或数字/boolean
        } else {
          blockEndCol = range.value.startColumn + value.length;
        }
        blockEndLine = index + 1;
      }
			block.startColumn = range.value.startColumn
			block.endLineNumber = blockEndLine
			block.endColumn = blockEndCol

			const keyStartCol = line.indexOf(`"${key}"`) + 2
			const keyEndCol = keyStartCol + key.length - 1
			const valueStartCol = line.indexOf(":") + 2
			const valueEndCol = line.length

			const node: JsonNode = {
				id: `n-${idCounter++}`,
				name: key,
				value: val,
				valueType,
				range,
				block,
				level: stack.length,
				dependencies: val === undefined ? true : false,
				expanded: false,
			}

			pushNode(node)
			if (valueType === "object" || valueType === "array") stack.push(node)
		})

		// 未闭合节点补全 endLine
		while (stack.length) {
			const node = stack.pop()
			if (node) {
				node.range.value.endLineNumber ??= lines.length
				node.range.value.endColumn ??= lines[lines.length - 1].length
			}
		}

		const map = new Map<string, JsonTree>()
		const tree: JsonTree[] = []

		nodes.forEach((n) => {
			const node: JsonTree = {
				id: n.id,
				name: n.name,
				value: n.value,
				valueType: n.valueType,
				range: n.range,
				block: n.block,
				level: n.level,
				children: [],
				expanded: n.expanded,
				dependencies: n.dependencies,
			}
			// if(hasOwn(n, 'endLine')) node.endLine = n.endLine;
			map.set(n.id, node)
		})

		nodes.forEach((n) => {
			const parentId = n.parent
			const node = map.get(n.id)!
			if (parentId && map.has(parentId)) {
				map.get(parentId)!.children!.push(node)
			} else {
				tree.push(node)
			}
		})
		return { nodes, tree }
	}, [lines])
}
