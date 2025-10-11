import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable"

export interface EditorProps {
	leftPanel: React.ReactNode
	rightPanel: React.ReactNode
}

const Editor = ({ leftPanel, rightPanel }: EditorProps) => {
	return (
		<ResizablePanelGroup direction="horizontal" className="min-w-full w-full h-full min-h-screen rounded-lg border">
			<ResizablePanel defaultSize={20} minSize={1}>
				{leftPanel}
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50}>{rightPanel}</ResizablePanel>
		</ResizablePanelGroup>
	)
}

export default Editor
