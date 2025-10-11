import { useEffect, useRef, useState } from "react"
import { Cell, Edge as X6Edge, Graph } from "@antv/x6"
import * as d3 from "d3"
import { JsonTree } from "./use-json-line-map"

const registerNodes = () => {
	Graph.registerNode(
		"custom-rect",
		{
			inherit: "rect",
			width: 160,
			height: 40,
			attrs: {
				body: {
					stroke: "#5F95FF",
					fill: "#EFF4FF",
					rx: 8,
					ry: 8,
				},
				label: {
					text: "Custom Node",
					fill: "#333",
					fontSize: 14,
				},
			},
		},
		true
	)
}

const registerEdges = () => {
	Graph.registerEdge(
		"custom-edge",
		{
			inherit: "edge", // ✅ 注意这里是 'edge'，不是 'line'
			attrs: {
				line: {
					stroke: "#A2B1C3",
					strokeWidth: 2,
					targetMarker: {
						name: "block",
						width: 8,
						height: 8,
					},
				},
			},
			zIndex: 0,
		},
		true
	)
}

export type GraphNode = Cell & {
	data?: any
}

export type GraphEdge = X6Edge & {
	data?: any
}

export interface UseGraphOptions extends Partial<Graph.Options> {
	data?: { nodes: GraphNode[]; edges: GraphEdge[] }
}
interface TreeNode extends d3.HierarchyNode<any> {
  x0?: number;
  y0?: number;
}

export const useGraph = (data:any) => {
	const ref = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);
	const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isExpanded = (id: string) => expandedMap[id] ?? true;

  useEffect(() => {
    if (!ref.current) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d")!;
    const width = canvas.width;
    const height = canvas.height;
		const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);
		console.log(data)
		if(!data || (data && !data.length)) return
		const root = d3.hierarchy(
      { id: "root", key: "root", children: data },
      d => (d.children && isExpanded(d.id) ? d.children : null)
    );

    const treeLayout = d3.tree().nodeSize([120, 80]);
    treeLayout(root);
		
		
		// const root = d3.hierarchy(data, (d) => {
		// 	// return typeof d === "object" && d !== null
    //   //   ? Array.isArray(d)
    //   //     ? d.map((v, i) => ({ [`[${i}]`]: v }))
    //   //     : Object.entries(d).map(([k, v]) => ({ [k]: v }))
    //   //   : null

		// 	return null
		// })
		// console.log(root)
  }, [data]);

  return ref;
}
