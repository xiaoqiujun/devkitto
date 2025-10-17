import Editor from "@/components/editor"
import FlowViewer from "@/components/flow-viewer"
import MonacoEditor, { MonacoEditorHandle } from "@/components/monaco-editor"
import { useCallback, useRef, useState } from "react"
// import transform from "./transform"
import jsonData from "../../monaco.json"
import { useJsonLineMap } from "@/hooks/use-json-line-map"
import TreeCard from "@/components/tree-card"


export const JSONEditor = () => {
  const [jsonText, setJsonText] = useState(JSON.stringify(jsonData, null, 2))
  return (
    <Editor
      language="json"
      value={jsonText}
      onContentChange={(val) => {
        setJsonText(JSON.stringify(JSON.parse(val), null, 2))
      }}
      // leftPanel={
      //   <MonacoEditor
      //     ref={monacoEditorRef}
      //     value={jsonText}
      //     language="json"
      //     onChange={setJsonText}
      //     onLinesContentChange={setLinesContent}
      //   />
      // }
      // rightPanel={
      //   <TreeCard tree={tree} onPosition={onPositionChange} />
      // }
    />
  )
}