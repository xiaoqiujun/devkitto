import { useMemo } from "react";
import {hasOwn} from "funtool"

interface JsonNode {
  /**
   * 节点唯一标识
   */
  id: string;
  /**
   * 键名
   */
  name: string;
  /**
   * 值
   */
  value?: string;
  /**
   * 值类型
   */
  valueType?: string;
  /**
   * 开始行号（1-based）
   */
  startLine: number;
  /**
   * 结束行号（1-based）
   */
  endLine?: number;
  /**
   * 层级深度（根为0）
   */
  level: number;
  /**
   * 父节点ID
   */
  parent?: string;
  /**
   * 是否有依赖（是否有子节点）
   */
  dependencies?: boolean;
  /**
   * 是否展开
   */
  expanded?: boolean;
}
export interface JsonTree extends JsonNode {
  /**
   * 子节点
   */
  children?: JsonTree[];
}

export function useJsonLineMap(lines: string[]) {
  return useMemo(() => {
    const stack: JsonNode[] = [];
    const nodes: JsonNode[] = [];
    let idCounter = 0;

    const pushNode = (node: JsonNode) => {
      nodes.push(node);
      if (stack.length > 0) node.parent = stack[stack.length - 1].id;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("}") || trimmed.startsWith("]")) {
        const last = stack.pop();
        if (last) last.endLine = index + 1;
        return;
      }

      const match = trimmed.match(/^"([^"]+)"\s*:\s*(.*)/);
      if (!match) return;

      const [, key, rest] = match;
      let value = rest.replace(/,$/, "").trim();
      let valueType: string | undefined;

      if (value.startsWith("{")) valueType = "object";
      else if (value.startsWith("[")) valueType = "array";
      else if (value.startsWith('"')) {
        valueType = "string";
        value = value.replace(/^"|"$/g, "");
      } else if (/^(true|false)$/.test(value)) valueType = "boolean";
      else if (value === "null") valueType = "null";
      else if (!isNaN(Number(value))) valueType = "number";

      const val = valueType === "object" || valueType === "array" ? undefined : value
      const node: JsonNode = {
        id: `n-${idCounter++}`,
        name:key,
        value: val,
        valueType,
        startLine: index + 1,
        level: stack.length,
        dependencies:val === undefined ? true: false,
        expanded: false,
      };

      pushNode(node);
      if (valueType === "object" || valueType === "array") stack.push(node);
    });

    // 未闭合节点补全 endLine
    while (stack.length) {
      const node = stack.pop();
      if (node && !node.endLine) node.endLine = lines.length;
    }

    const map = new Map<string, JsonTree>();
    const tree: JsonTree[] = [];

    nodes.forEach((n) => {
      const node: JsonTree = {
        id: n.id,
        name: n.name,
        value: n.value,
        valueType: n.valueType,
        startLine: n.startLine,
        level: n.level,
        children: [],
        expanded: n.expanded,
        dependencies: n.dependencies,
      };
      if(hasOwn(n, 'endLine')) node.endLine = n.endLine;
      map.set(n.id, node);
    });

    nodes.forEach((n) => {
      const parentId = n.parent;
      const node = map.get(n.id)!;
      if (parentId && map.has(parentId)) {
        map.get(parentId)!.children!.push(node);
      } else {
        tree.push(node);
      }
    });
    return {nodes,tree};
  }, [lines]);
}
