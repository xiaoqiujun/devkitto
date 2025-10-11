import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { ArrowBigLeft, CloudUpload, HardDriveUpload, File as FileIcon } from "lucide-react"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { invoke } from "@tauri-apps/api/core"
import { save } from "@tauri-apps/plugin-dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"

interface FileInfo {
	file: File
	base64?: string
	dataURI?: string
	width?: number
	height?: number
	textPreview?: string
	unsupportedPreview?: boolean
}

const formatFileSize = (size: number) => {
	if (size < 1024) return size + " B"
	if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB"
	return (size / 1024 / 1024).toFixed(2) + " MB"
}

const FileMode: React.FC = () => {
	const [files, setFiles] = useState<FileInfo[]>([])
	const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
	const [base64Format, setBase64Format] = useState<"full" | "datauri">("full")
	const dropAreaRef = useRef<HTMLDivElement>(null)

	const onFiles = (selectedFiles: FileList | File[]) => {
		Array.from(selectedFiles).forEach((file) => {
			const reader = new FileReader()
			reader.onload = (ev) => {
				const result = ev.target?.result as string
				let base64 = ""
				let dataURI = ""
				let textPreview: string | undefined
				let unsupportedPreview = false

				if (file.type.startsWith("image/")) {
					base64 = result.split(",")[1]
					dataURI = result
					const img = new Image()
					img.onload = () => {
						setFiles((prev) => [...prev, { file, base64, dataURI, width: img.width, height: img.height }])
						setSelectedFileIndex((prev) => prev ?? 0)
					}
					img.src = result
				} else if (file.type.startsWith("text/")) {
					const content = result
					base64 = btoa(unescape(encodeURIComponent(content)))
					dataURI = `data:${file.type};base64,${base64}`
					textPreview = content.slice(0, 500)
					setFiles((prev) => [...prev, { file, base64, dataURI, textPreview }])
					setSelectedFileIndex((prev) => prev ?? 0)
				} else if (file.type === "application/pdf") {
					dataURI = result
					base64 = result.split(",")[1]
					setFiles((prev) => [...prev, { file, base64, dataURI }])
					setSelectedFileIndex((prev) => prev ?? 0)
				} else {
					unsupportedPreview = true
					const binaryStr = atob(result.split(",")[1] || "")
					base64 = btoa(binaryStr)
					dataURI = `data:${file.type};base64,${base64}`
					setFiles((prev) => [...prev, { file, base64, dataURI, unsupportedPreview }])
					setSelectedFileIndex((prev) => prev ?? 0)
				}
			}

			if (file.type.startsWith("image/") || file.type === "application/pdf") {
				reader.readAsDataURL(file)
			} else if (file.type.startsWith("text/")) {
				reader.readAsText(file)
			} else {
				reader.readAsDataURL(file)
			}
		})
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) onFiles(e.target.files)
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.dataTransfer.files) onFiles(e.dataTransfer.files)
		dropAreaRef.current?.classList.remove("border-primary")
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		dropAreaRef.current?.classList.add("border-primary")
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		dropAreaRef.current?.classList.remove("border-primary")
	}

	const selectedFile = selectedFileIndex !== null ? files[selectedFileIndex] : null
	const displayBase64 = base64Format === "full" ? selectedFile?.base64 : selectedFile?.dataURI

	const onCopy = async () => {
		if (!displayBase64) return
		// navigator.clipboard.writeText(displayBase64)
		await writeText(displayBase64)
		toast("✅ 已复制 Base64")
	}

	const handleDownload = () => {
		if (!displayBase64 || !selectedFile) return
		const blob = new Blob([displayBase64], { type: "text/plain;charset=utf-8" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `file-${selectedFile.file.name}.txt`
		a.click()
		URL.revokeObjectURL(url)
	}

	const handleClear = () => {
		setFiles([])
		setSelectedFileIndex(null)
	}

	const handleDownloadAllZip = async () => {
		if (files.length === 0) return

		// 构造文件列表
		const fileItems = files
			.filter((f) => f.base64)
			.map((f) => ({
				name: f.file.name,
				content: f.base64 || "",
			}))

		if (fileItems.length === 0) return

		try {
			// 1️⃣ 尝试调用 Rust save_zip
			const savePath = await save({
				title: "选择保存路径",
				defaultPath: "all-files-base64.zip",
				filters: [{ name: "ZIP", extensions: ["zip"] }],
			})
			console.log(savePath)
			if (!savePath) return

			await invoke("save_zip", { files: fileItems, savePath: savePath })
			toast("✅ 文件已保存！")
		} catch (err) {
			console.error("Rust save_zip 失败，回退到前端 JSZip:", err)
			try {
				// 2️⃣ 回退到前端 JSZip + FileSaver
				const zip = new JSZip()
				fileItems.forEach((f) => zip.file(f.name, f.content))
				const content = await zip.generateAsync({ type: "blob" })
				saveAs(content, "all-files-base64.zip")
				toast("✅ 文件已保存！")
			} catch (err2) {
				console.error("前端生成 ZIP 也失败:", err2)
				toast("❌ 无法生成 ZIP 文件")
			}
		}
	}

	const renderPreview = (fileInfo: FileInfo) => {
		if (fileInfo.unsupportedPreview) {
			return (
				<div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg text-center">
					<FileIcon className="text-4xl text-gray-400 mb-2" />
					<p className="text-sm">⚠️ 该文件类型无法预览</p>
					<p className="text-xs text-gray-500">{fileInfo.file.name}</p>
				</div>
			)
		} else if (fileInfo.file.type.startsWith("image/")) {
			return <img src={fileInfo.dataURI} alt="预览" className="max-w-full max-h-[300px] object-contain" />
		} else if (fileInfo.file.type.startsWith("text/")) {
			return (
				<pre className="max-h-[300px] overflow-auto bg-gray-100 p-2 rounded-lg text-xs font-mono whitespace-pre-wrap break-all">
					{fileInfo.textPreview}
				</pre>
			)
		} else if (fileInfo.file.type === "application/pdf") {
			return (
				<iframe src={fileInfo.dataURI} className="w-full h-[300px] border rounded-lg" title="PDF 预览"></iframe>
			)
		}
		return null
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* 左侧 */}
			<div className="bg-white rounded-xl p-6 card-shadow hover-lift">
				<h2 className="text-xl font-semibold mb-4 flex items-center">
					<HardDriveUpload /> 上传文件
				</h2>

				<div
					ref={dropAreaRef}
					className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-300 hover:border-primary mb-4"
					onClick={() => document.getElementById("fileInput")?.click()}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
				>
					<CloudUpload className="mx-auto mb-2" />
					<p className="text-gray-600 mb-2">拖放文件到这里，或点击选择文件</p>
					<p className="text-gray-400 text-sm">支持图片、文本、PDF 等格式</p>
					<Input type="file" id="fileInput" className="hidden" onChange={handleFileChange} multiple />
				</div>

				{files.length > 0 && (
					<ul className="space-y-2 mb-4">
						{files.map((f, idx) => (
							<li
								key={idx}
								className={`p-2 rounded-lg cursor-pointer border ${
									selectedFileIndex === idx ? "border-primary bg-primary/10" : "border-gray-200"
								}`}
								onClick={() => setSelectedFileIndex(idx)}
							>
								{f.file.name} ({formatFileSize(f.file.size)})
							</li>
						))}
					</ul>
				)}

				{selectedFile && (
					<div className="mt-4 border rounded-lg overflow-hidden bg-gray-100 flex justify-center items-center">
						{renderPreview(selectedFile)}
					</div>
				)}

				{files.length > 0 && (
					<div className="flex gap-2 mt-4">
						<button className="px-4 py-2 bg-red-500 text-white rounded-lg" onClick={handleClear}>
							清空列表
						</button>
						<button className="px-4 py-2 bg-green-500 text-white rounded-lg" onClick={handleDownloadAllZip}>
							批量下载 ZIP
						</button>
					</div>
				)}
			</div>

			{/* 右侧 Base64 */}
			<div className="bg-white rounded-xl p-6 card-shadow hover-lift">
				<h2 className="text-xl font-semibold mb-4 flex items-center">
					<i className="fa fa-code text-primary mr-2" aria-hidden="true"></i> Base64 编码
				</h2>

				{selectedFile ? (
					<>
						<div className="flex flex-wrap gap-2 mb-3">
							<button
								onClick={onCopy}
								className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
							>
								复制编码
							</button>
							<button
								onClick={handleDownload}
								className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
							>
								下载文本
							</button>
							<Select
								value={base64Format}
								defaultValue="full"
								onValueChange={(value) => setBase64Format(value as "full" | "datauri")}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="选择编码格式" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="full">完整编码</SelectItem>
										<SelectItem value="datauri">Data URI</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						{/* 文件信息 */}
						<div className="grid grid-cols-2 gap-3 mb-3 text-sm">
							<div className="bg-gray-50 p-2 rounded-lg">
								<p className="text-gray-500">文件名</p>
								<p className="font-medium">{selectedFile.file.name}</p>
							</div>
							<div className="bg-gray-50 p-2 rounded-lg">
								<p className="text-gray-500">MIME 类型</p>
								<p className="font-medium">{selectedFile.file.type || "-"}</p>
							</div>
							<div className="bg-gray-50 p-2 rounded-lg">
								<p className="text-gray-500">大小</p>
								<p className="font-medium">{formatFileSize(selectedFile.file.size)}</p>
							</div>
							{selectedFile.width && selectedFile.height && (
								<div className="bg-gray-50 p-2 rounded-lg">
									<p className="text-gray-500">分辨率</p>
									<p className="font-medium">
										{selectedFile.width} × {selectedFile.height}
									</p>
								</div>
							)}
						</div>

						<div className="relative">
							<pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[300px] text-xs md:text-sm font-mono whitespace-pre-wrap break-all min-w-full">
								{displayBase64}
							</pre>
						</div>
					</>
				) : (
					<div className="text-center py-12 text-gray-400">
						<ArrowBigLeft className="mx-auto mb-2" />
						<p>请选择文件后显示 Base64 编码</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default FileMode
