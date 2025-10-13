import React from 'react'
import ReactDOM from 'react-dom/client'
import * as d3 from 'd3'

export interface NodeData {
  id: string
  x: number
  y: number
  width: number
  height: number
  label?: string
  fill?: string
  stroke?: string
  reactComponent?: React.ReactNode
  container?: HTMLDivElement
}

export interface TreeNode {
  id: string
  label?: string
  children?: TreeNode[]
}

export interface GraphOptions {
  container: HTMLElement
  grid?: boolean
  width?: number
  height?: number
  devicePixelRatio?: number
  nodeDefault?: { width: number; height: number }
  edgeRender?: 'canvas' | 'svg'
}

function uid(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).substr(2, 9)
}

export class Graph {
  container: HTMLElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  nodeLayer: HTMLDivElement
  nodes = new Map<string, NodeData>()
  edges: Array<{ source: NodeData; target: NodeData }> = []
  grid = true
  width: number
  height: number
  dpr: number
  nodeDefault: { width: number; height: number }
  scale = 1
  offsetX = 0
  offsetY = 0
  private draggingNode: NodeData | null = null
  private dragOffsetX = 0
  private dragOffsetY = 0
  edgeRender: 'canvas' | 'svg'
  svg?: SVGSVGElement
  svgEdgesLayer?: SVGGElement

  constructor(options: GraphOptions) {
    this.container = options.container
    this.width = options.width || this.container.clientWidth
    this.height = options.height || this.container.clientHeight
    this.dpr = options.devicePixelRatio || window.devicePixelRatio || 1
    this.grid = options.grid ?? true
    this.nodeDefault = options.nodeDefault || { width: 120, height: 60 }
    this.edgeRender = options.edgeRender || 'canvas'

    // Canvas 网格
    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')!
    this.resizeCanvas()

    // 节点层
    this.nodeLayer = document.createElement('div')
    this.nodeLayer.style.position = 'absolute'
    this.nodeLayer.style.top = '0'
    this.nodeLayer.style.left = '0'
    this.nodeLayer.style.width = '100%'
    this.nodeLayer.style.height = '100%'
    this.nodeLayer.style.pointerEvents = 'none'
    this.container.appendChild(this.nodeLayer)

    // SVG 边层
    if (this.edgeRender === 'svg') {
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      this.svg.setAttribute('width', '100%')
      this.svg.setAttribute('height', '100%')
      this.svg.style.position = 'absolute'
      this.svg.style.top = '0'
      this.svg.style.left = '0'
      this.container.appendChild(this.svg)
      this.svgEdgesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      this.svg.appendChild(this.svgEdgesLayer)
    }

    this.bindEvents()
    this.render()
  }

  private resizeCanvas() {
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(this.dpr, this.dpr)
  }

  private bindEvents() {
    window.addEventListener('resize', () => {
      this.width = this.container.clientWidth
      this.height = this.container.clientHeight
      this.resizeCanvas()
      this.render()
    })

    this.nodeLayer.addEventListener('mousedown', (e) => {
      const target = (e.target as HTMLElement).closest('[data-node-id]')
      if (target) {
        const id = target.getAttribute('data-node-id')!
        const node = this.nodes.get(id)!
        this.draggingNode = node
        this.dragOffsetX = e.clientX - node.x
        this.dragOffsetY = e.clientY - node.y
        e.preventDefault()
      }
    })

    window.addEventListener('mousemove', (e) => {
      if (this.draggingNode) {
        this.draggingNode.x = (e.clientX - this.dragOffsetX) / this.scale - this.offsetX
        this.draggingNode.y = (e.clientY - this.dragOffsetY) / this.scale - this.offsetY
        this.updateNode(this.draggingNode.id)
        this.renderEdges()
      }
    })

    window.addEventListener('mouseup', () => {
      this.draggingNode = null
    })

    // 缩放滚轮
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault()
      const scaleAmount = e.deltaY > 0 ? 0.9 : 1.1
      this.scale *= scaleAmount
      this.render()
    })
  }

  addNode(node: Partial<NodeData>) {
    const id = node.id || uid('n')
    const nd: NodeData = {
      id,
      x: node.x ?? 100,
      y: node.y ?? 100,
      width: node.width ?? this.nodeDefault.width,
      height: node.height ?? this.nodeDefault.height,
      label: node.label ?? id,
      fill: node.fill ?? '#4f46e5',
      stroke: node.stroke ?? '#111827',
      reactComponent: node.reactComponent
    }

    this.nodes.set(id, nd)

    if (nd.reactComponent) {
      const div = document.createElement('div')
      div.setAttribute('data-node-id', id)
      div.style.position = 'absolute'
      div.style.left = `${nd.x}px`
      div.style.top = `${nd.y}px`
      div.style.width = `${nd.width}px`
      div.style.height = `${nd.height}px`
      div.style.pointerEvents = 'auto'
      this.nodeLayer.appendChild(div)
      nd.container = div
      const root = ReactDOM.createRoot(div)
      root.render(nd.reactComponent)
    }

    this.renderEdges()
    this.render()
    return nd
  }

  updateNode(id: string, patch?: Partial<NodeData>) {
    const n = this.nodes.get(id)
    if (!n) return
    if (patch) Object.assign(n, patch)
    if (n.container) {
      n.container.style.left = `${n.x}px`
      n.container.style.top = `${n.y}px`
      n.container.style.width = `${n.width}px`
      n.container.style.height = `${n.height}px`
      if (patch?.reactComponent) {
        const root = ReactDOM.createRoot(n.container)
        root.render(patch.reactComponent)
      }
    }
    this.renderEdges()
    this.render()
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height)
    if (this.grid) this.drawGrid()
    this.renderEdges()
  }

  private drawGrid() {
    const ctx = this.ctx
    const size = 20
    const scaledSize = size * this.scale
    ctx.save()
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 0.5
    for (let x = (this.offsetX * this.scale) % scaledSize; x < this.width; x += scaledSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.height)
      ctx.stroke()
    }
    for (let y = (this.offsetY * this.scale) % scaledSize; y < this.height; y += scaledSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.width, y)
      ctx.stroke()
    }
    ctx.restore()
  }

  private renderEdges() {
    if (this.edgeRender === 'canvas') {
      const ctx = this.ctx
      ctx.save()
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1
      this.edges.forEach(e => {
        ctx.beginPath()
        ctx.moveTo(e.source.x + e.source.width / 2, e.source.y + e.source.height / 2)
        ctx.lineTo(e.target.x + e.target.width / 2, e.target.y + e.target.height / 2)
        ctx.stroke()
      })
      ctx.restore()
    } else if (this.edgeRender === 'svg' && this.svgEdgesLayer) {
      this.svgEdgesLayer.innerHTML = ''
      this.edges.forEach(e => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', `${e.source.x + e.source.width / 2}`)
        line.setAttribute('y1', `${e.source.y + e.source.height / 2}`)
        line.setAttribute('x2', `${e.target.x + e.target.width / 2}`)
        line.setAttribute('y2', `${e.target.y + e.target.height / 2}`)
        line.setAttribute('stroke', '#94a3b8')
        line.setAttribute('stroke-width', '1')
        this.svgEdgesLayer!.appendChild(line)
      })
    }
  }

  renderTree(data: TreeNode, nodeWidth = 120, nodeHeight = 60, spacing = 80) {
    const root = d3.hierarchy<TreeNode>(data)
    const treeLayout = d3.tree<TreeNode>().nodeSize([nodeWidth + spacing, nodeHeight + spacing])
    const tree = treeLayout(root)

    // 清空节点和边
    this.nodeLayer.innerHTML = ''
    this.nodes.clear()
    this.edges = []

    // 添加节点和边
    tree.descendants().forEach(d => {
      const node = this.addNode({
        id: d.data.id,
        x: d.x - nodeWidth / 2,
        y: d.y - nodeHeight / 2,
        width: nodeWidth,
        height: nodeHeight,
        label: d.data.label ?? d.data.id
      })

      if (d.parent) {
        const parentNode = this.nodes.get(d.parent.data.id)!
        this.edges.push({ source: parentNode, target: node })
      }
    })

    this.render()
  }
}
