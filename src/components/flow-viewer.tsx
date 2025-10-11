import React, { useEffect, useRef } from "react"
import { Graph } from "@antv/x6"
import { GraphEdge, GraphNode, useGraph } from "@/hooks/use-graph"
import jsonData from "@/monaco.json"

interface X6MindMapProps {
	json: any
}

const X6MindMap: React.FC<X6MindMapProps> = ({ json }) => {
	const canvasRef = useGraph(json)

	return (
		<div className="w-full h-full">
			<canvas
				ref={canvasRef}
				width={1200}
				height={600}
				style={{ width: "100%", height: "100%", cursor: "grab" }}
			/>
		</div>
	)
}

export default X6MindMap
