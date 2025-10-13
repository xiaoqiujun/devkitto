import React, { useEffect, useRef } from "react"
import { Graph } from "@antv/x6"
import jsonData from "@/monaco.json"
import { useGraph } from "@/hooks/use-graph"

interface X6MindMapProps {
	json: any
}

const X6MindMap: React.FC<X6MindMapProps> = ({ json }) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const { renderTree, addNode } = useGraph(containerRef, { grid: true, edgeRender: 'canvas' })
	// const canvasRef = useGraph(json)
	const treeData = {
    id: 'root',
    label: 'Root',
    children: [
      { id: 'a', label: 'A' },
      {
        id: 'b',
        label: 'B',
        children: [
          { id: 'b1', label: 'B1' },
          { id: 'b2', label: 'B2' }
        ]
      }
    ]
  }

	useEffect(() => {
		renderTree(treeData)
	}, [renderTree])

	return (
		<div className="w-full h-full">
			<div style={{ width: '100%', height: '600px', position: 'relative' }} ref={containerRef}></div>
			{/* <canvas
				ref={containerRef}
				width={1200}
				height={600}
				style={{ width: "100%", height: "100%", cursor: "grab" }}
			/> */}
		</div>
	)
}

export default X6MindMap
