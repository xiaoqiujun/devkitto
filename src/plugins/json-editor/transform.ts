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