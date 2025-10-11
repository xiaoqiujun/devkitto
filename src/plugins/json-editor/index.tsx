import Editor from "@/components/editor"
import FlowViewer from "@/components/flow-viewer"
import MonacoEditor from "@/components/monaco-editor"
import { useState } from "react"
// import transform from "./transform"
import jsonData from "../../monaco.json"
import { useJsonLineMap } from "@/hooks/use-json-line-map"


export const JSONEditor = () => {

  const [jsonText, setJsonText] = useState(JSON.stringify(jsonData, null, 2))
  const [linesContent, setLinesContent] = useState<string[]>([])
  
  const { nodes, tree } = useJsonLineMap(linesContent)
  console.log(linesContent,nodes, tree)

  return (
    <Editor
      leftPanel={
        <MonacoEditor
          value={jsonText}
          language="json"
          onChange={setJsonText}
          onLinesContentChange={setLinesContent}
        />
      }
      rightPanel={
        <FlowViewer json={tree} />
        // <div></div>
      }
    />
  )
}