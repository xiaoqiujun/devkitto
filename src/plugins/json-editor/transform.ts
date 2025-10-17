// import { EdgeData, FlowData, NodeData } from "@/components/flow-viewer";

// const transform = (json:any):FlowData => {
//   const nodes: any[] = [];
//   const edges: any[] = [];
//   let idCounter = 0;
//   const genId = () => `n${++idCounter}`;

//   const traverse = (
//     key: string,
//     value: any,
//     parentId: string | null,
//     depth = 0,
//     index = 0,
//     collapsed = true
//   ) => {
//     const id = genId();
//     const label =
//       typeof value === 'object' && value !== null
//         ? key
//         : `${key}: ${String(value)}`;

//     nodes.push({
//       id,
//       label,
//       x: depth * 180,
//       y: index * 60,
//       width: 140,
//       height: 40,
//       data: {
//         label,
//         collapsed,
//         children:
//           typeof value === 'object' && value !== null
//             ? Array.isArray(value)
//               ? value
//               : Object.entries(value)
//             : undefined,
//       },
//     });

//     if (parentId) {
//       edges.push({ id: `${parentId}-${id}`, source: parentId, target: id });
//     }

//     // 仅展开的节点递归生成子节点
//     if (!collapsed && typeof value === 'object' && value !== null) {
//       if (Array.isArray(value)) {
//         value.forEach((item, i) =>
//           traverse(`${key}[${i}]`, item, id, depth + 1, i, true)
//         );
//       } else {
//         Object.entries(value).forEach(([childKey, childValue], i) =>
//           traverse(childKey, childValue, id, depth + 1, i, true)
//         );
//       }
//     }
//   };

//   traverse('root', json, null, 0, 0, true);
//   return { nodes, edges };
// }

// const isVisible = (
//   node: any,
//   viewport: { x: number; y: number; width: number; height: number }
// ) => {
//   return (
//     node.x + node.width >= viewport.x &&
//     node.x <= viewport.x + viewport.width &&
//     node.y + node.height >= viewport.y &&
//     node.y <= viewport.y + viewport.height
//   );
// };

// export default transform

// 定义行列位置
interface Position {
  startLineNumber: number // 起始行
  startColumn: number     // 起始列
  endLineNumber: number   // 结束行
  endColumn: number       // 结束列
}

// 键和值的范围
interface Range {
  key: Position
  value: Position
}

// JSON 节点类型
interface JsonNode {
  id: string                 // 唯一 ID
  name: string               // 键名
  value?: string | number | boolean | null  // 键值（基本类型）
  valueType?: string         // 类型：object、array、string、number 等
  range: Range               // 键和值的行列范围
  block: Position            // 节点块范围（对象/数组整个范围）
  level: number              // 层级深度
  parent?: string            // 父节点 ID
  dependencies?: number      // 子节点数量，默认 0
  expanded?: boolean         // 是否展开显示
}

// JSON 树节点类型
export interface JsonTree extends JsonNode {
  children?: JsonTree[]      // 子节点
}

// hook 返回值类型
export interface JsonParseResult {
  nodes: JsonNode[]          // 扁平节点列表
  tree: JsonTree[]           // 树结构
  totalNodes: number         // 节点总数
  totalLines: number         // 总行数
}

/**
 * 🚀 解析 JSON 文本为节点 + 树结构
 * 特性：
 * - 支持数组元素和空键
 * - 记录层级、行列、block 范围
 * - 递归统计 dependencies
 */
export const transformJsonLineMap = (lines: string[]):JsonParseResult => {
  let idCounter = 0
    const stack: JsonNode[] = []
    const nodes: JsonNode[] = []
		const arrayIndex: number[] = []

    const pushNode = (node: JsonNode) => {
      nodes.push(node)
      if (stack.length > 0) node.parent = stack[stack.length - 1].id
    }

    /**
     * 查找对象/数组闭合位置
     */
    const findBlockEnd = (lines: string[], startIndex: number, type: "object" | "array"): [number, number] => {
      let openCount = 0
      let foundStart = false
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i]
        for (let j = 0; j < line.length; j++) {
          const ch = line[j]
          if (!foundStart) {
            if ((type === "object" && ch === "{") || (type === "array" && ch === "[")) {
              openCount = 1
              foundStart = true
            }
          } else {
            if (type === "object") {
              if (ch === "{") openCount++
              else if (ch === "}") openCount--
            } else {
              if (ch === "[") openCount++
              else if (ch === "]") openCount--
            }
            if (openCount === 0) return [i + 1, j + 1]
          }
        }
      }
      return [lines.length, lines[lines.length - 1].length ?? 1]
    }

    // 主循环逐行解析
    lines.forEach((line, i) => {
      const lineNum = i + 1
      const trimmed = line.trim()
      if (!trimmed) return

      const indent = line.match(/^\s*/)?.[0].length ?? 0
      const parentNode = stack[stack.length - 1]
      const inArray = parentNode?.valueType === "array"
			let index = 0;

      // 初始化范围
      const range: Range = {
        key: { startLineNumber: lineNum, startColumn: indent, endLineNumber: lineNum, endColumn: line.length },
        value: { startLineNumber: lineNum, startColumn: indent, endLineNumber: lineNum, endColumn: line.length },
      }
      const block: Position = { ...range.value }

      // 遇到闭合符 } ] 弹出栈
      if (/^[}\]]/.test(trimmed)) {
        stack.pop()
				index = 0
        return
      }

      // 匹配 key-value
      let key = ""
      let valueStr = trimmed
      const match = trimmed.match(/^"([^"]*)"\s*:\s*(.*)/)
      if (match) {
        key = match[1] || "(empty)"
        valueStr = match[2].replace(/,$/, "").trim()
      } else if (inArray) {
				// 数组元素，key 使用数组索引
        const index = arrayIndex[arrayIndex.length - 1] || 0
        key = `[ ${index} ]`
        valueStr = trimmed.replace(/,$/, "").trim()
        arrayIndex[arrayIndex.length - 1] = index + 1
      } else {
        return
      }

      // 推断值类型
      let valueType: string | undefined
      let parsedValue: any = valueStr
      if (valueStr.startsWith("{")) valueType = "object"
      else if (valueStr.startsWith("[")) valueType = "array"
      else if (/^".*"$/.test(valueStr)) {
        valueType = "string"
        parsedValue = valueStr.slice(1, -1)
      } else if (/^(true|false)$/.test(valueStr)) {
        valueType = "boolean"
        parsedValue = valueStr === "true"
      } else if (valueStr === "null") {
        valueType = "null"
        parsedValue = null
      } else if (!isNaN(Number(valueStr))) {
        valueType = "number"
        parsedValue = Number(valueStr)
      }

      const isContainer = valueType === "object" || valueType === "array"

      // 计算 key/value 列范围
      if (!inArray) {
        range.key.startColumn = line.indexOf(`"${key}"`) + 2
        range.key.endColumn = range.key.startColumn + key.length - 1
        range.value.startColumn = line.indexOf(":") + 2
        range.value.endColumn = line.length
      }

      // 计算 block 范围
      if (isContainer) {
        const [endLine, endCol] = findBlockEnd(lines, i, valueType! as "object" | "array")
        block.endLineNumber = endLine
        block.endColumn = endCol
      } else {
        const valMatch = line.slice(range.value.startColumn).match(/^(.*?)(,|\s*$)/)
        block.endLineNumber = lineNum
        block.endColumn = range.value.startColumn + (valMatch?.[1]?.length ?? valueStr.length)
      }

      // 创建节点
      const node: JsonNode = {
        id: `n-${idCounter++}`,
        name: key || "(empty)",
        value: isContainer ? undefined : parsedValue,
        valueType,
        range,
        block,
        level: stack.length,
        dependencies: 0,
        expanded: true,
      }

      pushNode(node)
      if (isContainer) {
				stack.push(node)
				arrayIndex.push(0)
			}
    })

    // 补全未闭合节点
    for (const node of stack) {
      node.range.value.endLineNumber ??= lines.length
      node.range.value.endColumn ??= lines[lines.length - 1].length ?? 1
    }

    // 构建树 + 递归统计 dependencies
    const map = new Map<string, JsonTree>()
    const tree: JsonTree[] = []

    for (const n of nodes) {
      map.set(n.id, { ...n, children: [] })
    }

    for (const n of nodes) {
      const node = map.get(n.id)!
      if (n.parent && map.has(n.parent)) {
        const parent = map.get(n.parent)!
        parent.children!.push(node)

        // 递归累加祖先 dependencies
        let current: JsonTree | undefined = parent
        while (current) {
          current.dependencies = (current.dependencies ?? 0) + 1
          if (!current.parent) break
          current = map.get(current.parent)
        }
      } else {
        tree.push(node)
      }
    }

    return {
      nodes,
      tree,
      totalNodes: nodes.length,
      totalLines: lines.length,
    }
}

/**
 * 🖨 打印 JSON 树（层级、dependencies、行列范围、折叠展开）
 */
export const printJsonTree = (
  tree: JsonTree[],
  indent: string = "",
  showRange: boolean = true
) => {
  tree.forEach((node, index) => {
    const isLast = index === tree.length - 1
    const prefix = indent + (isLast ? "└─ " : "├─ ")

    const rangeStr = showRange
      ? ` [${node.range.key.startLineNumber},${node.range.key.startColumn}-${node.range.value.endLineNumber},${node.range.value.endColumn}]`
      : ""

    if (node.valueType === "object" || node.valueType === "array") {
      console.log(`${prefix}${node.name || "(empty)"} (${node.dependencies})${rangeStr}`)
      if (node.expanded) {
        printJsonTree(node.children || [], indent + (isLast ? "   " : "│  "), showRange)
      }
    } else {
      console.log(`${prefix}${node.name}: ${JSON.stringify(node.value)}${rangeStr}`)
    }
  })
}