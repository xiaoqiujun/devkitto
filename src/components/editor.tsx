import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable"

export interface EditorProps {
	leftPanel: React.ReactNode
	rightPanel: React.ReactNode
}

const Editor = ({ leftPanel, rightPanel }: EditorProps) => {
	return (
		<ResizablePanelGroup direction="horizontal" className="min-w-full w-full rounded-lg border">
			<ResizablePanel defaultSize={20} minSize={1}>
				{leftPanel}
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50}>
				<div className="w-full max-h-screen overflow-auto">{rightPanel}</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	)
}

export default Editor
