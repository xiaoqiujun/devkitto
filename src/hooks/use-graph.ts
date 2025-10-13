import { useEffect, useRef } from 'react'
import { Graph, TreeNode, NodeData } from '@/utils/canvas-ui'

export interface UseGraphOptions {
  grid?: boolean
  width?: number
  height?: number
  devicePixelRatio?: number
  edgeRender?: 'canvas' | 'svg'
}

export function useGraph(
  containerRef: React.RefObject<HTMLElement>,
  options?: UseGraphOptions
) {
  const graphRef = useRef<Graph | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const g = new Graph({
      container: containerRef.current,
      grid: options?.grid ?? true,
      width: options?.width,
      height: options?.height,
      devicePixelRatio: options?.devicePixelRatio,
      edgeRender: options?.edgeRender ?? 'canvas'
    })

    graphRef.current = g

    return () => {
      // 清理 DOM
      containerRef.current!.innerHTML = ''
      graphRef.current = null
    }
  }, [containerRef, options])

  const renderTree = (data: TreeNode) => {
    graphRef.current?.renderTree(data)
  }

  const addNode = (node: Partial<NodeData>) => {
    return graphRef.current?.addNode(node)
  }

  const updateNode = (id: string, patch?: Partial<NodeData>) => {
    graphRef.current?.updateNode(id, patch)
  }

  const getGraph = () => graphRef.current

  return { renderTree, addNode, updateNode, getGraph }
}
