import Editor from "@/components/editor"
import FlowViewer from "@/components/flow-viewer"
import MonacoEditor, { MonacoEditorHandle } from "@/components/monaco-editor"
import { useCallback, useRef, useState } from "react"
// import transform from "./transform"
import jsonData from "../../monaco.json"
import { useJsonLineMap } from "@/hooks/use-json-line-map"
import TreeCard from "@/components/tree-card"


export const JSONEditor = () => {
  const monacoEditorRef = useRef<MonacoEditorHandle>(null)

  const [jsonText, setJsonText] = useState(JSON.stringify(jsonData, null, 2))
  const [linesContent, setLinesContent] = useState<string[]>([])
  
  const { nodes, tree } = useJsonLineMap(linesContent)
  console.log(linesContent,nodes, tree)
  const onPositionChange = (lineNumber: number, column: number) => {
    console.log("跳转",lineNumber, column)
    if (monacoEditorRef.current) {
      monacoEditorRef.current.positionAt(lineNumber, column)
    }
  }
  return (
    <Editor
      leftPanel={
        <MonacoEditor
          ref={monacoEditorRef}
          value={jsonText}
          language="json"
          onChange={setJsonText}
          onLinesContentChange={setLinesContent}
        />
      }
      rightPanel={
        <TreeCard tree={tree} onPositionChange={onPositionChange} />
      }
    />
  )
}