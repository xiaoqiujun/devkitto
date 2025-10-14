import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { JsonTree } from "@/hooks/use-json-line-map"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import ValueTypeIcon, { ValueType, ValueTypeMap } from "./value-type-icon"
import { cn } from "@/lib/utils"
import { Input } from "./ui/input"

const TreeArrow = ({ size = 16, className = "" }: { size?: number; className?: string }) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={`
        mr-1 text-gray-500 transition-transform duration-200 ease-in-out
        group-data-[state=open]:rotate-90
        ${className}
      `}
		>
			<path
				d="M8 6.5C8 5.95 8.45 5.5 9 5.5c.2 0 .4.05.55.15l7 5c.65.45.65 1.3 0 1.75l-7 5a.93.93 0 0 1-.55.15c-.55 0-1-.45-1-1V6.5Z"
				fill="currentColor"
			/>
		</svg>
	)
}

const TreeValue = ({
	valueType,
	value,
	children,
	expanded,
	className = "",
}: {
	valueType: ValueType
	value: any
	children?: JsonTree[]
	expanded?: boolean
	className?: string
}) => {
	switch (valueType) {
		case "string":
			return (
				<Input
					name="treeValue"
					placeholder="输入值"
					className="max-w-full truncate whitespace-nowrap overflow-hidden text-ellipsis border-none shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-gray-400"
					value={value}
				/>
			)
		case "number":
			return (
				<Input
					name="treeValue"
					placeholder="输入值"
					className="max-w-full truncate whitespace-nowrap overflow-hidden text-ellipsis border-none shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-gray-400"
					value={value}
				/>
			)
		case "boolean":
			return (
				<span
					className={cn(
						"ml-1.5 text-sm text-green-400 truncate whitespace-nowrap overflow-hidden text-ellipsis",
						className
					)}
				>
					{value ? "true" : "false"}
				</span>
			)
		case "array":
			return (
				<span
					className={cn(
						"ml-1.5 text-sm text-yellow-400 truncate whitespace-nowrap overflow-hidden text-ellipsis",
						className
					)}
				>{`[ ${children.length} items ]`}</span>
			)
		case "object":
			return (
				<span
					className={cn(
						"ml-1.5 text-sm text-purple-400 truncate whitespace-nowrap overflow-hidden text-ellipsis",
						className
					)}
				>{`{ ${children.length} keys }`}</span>
			)
		case "null":
			return (
				<span
					className={cn(
						"ml-1.5 text-sm text-gray-400 truncate whitespace-nowrap overflow-hidden text-ellipsis",
						className
					)}
				>
					null
				</span>
			)
		default:
			return (
				<span
					className={cn(
						"ml-1.5 text-sm text-red-400 truncate whitespace-nowrap overflow-hidden text-ellipsis",
						className
					)}
				>
					unknown
				</span>
			)
	}
}

export interface TreeCardProps {
	tree: JsonTree[]
	onPositionChange?:(lineNumber: number, column: number) => void
}
const TreeCard = ({ tree,onPositionChange }: TreeCardProps) => {
	const [treeData, setTreeData] = useState(tree)
	useEffect(() => {
		setTreeData(tree)
	}, [tree])

	const valueTypeMap = ValueTypeMap.map(([value, label]) => {
		return {
			value: value,
			label: label,
		}
	})
	const onSelectValueType = (event: any) => {
		console.log(event)
	}
	const onInputFocus = (tree:JsonTree) => {
		console.log("input focus",tree)
		onPositionChange?.(tree.startLine,1)
	}
	return (treeData || []).map((tree) => {
		return (
			<div className="json-tree relative p-3 flex w-full h-auto bg-gray-50 rounded-xs" key={tree.id}>
				{/* {tree.level > 0 ? <div className="absolute top-0 left-3 h-full w-[1px] bg-slate-400"></div> : null} */}
				<Collapsible className="w-full rounded-xs py-2.5 px-3 bg-slate-200/50">
					<div className="flex items-center justify-start w-fll max-w-full">
						{tree.expanded ? (
							<CollapsibleTrigger asChild>
								<div className="group cursor-pointer">
									<TreeArrow />
								</div>
							</CollapsibleTrigger>
						) : null}
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<div className="cursor-pointer">
									<ValueTypeIcon valueType={tree.valueType as ValueType} />
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								<DropdownMenuRadioGroup value={tree.valueType as ValueType}>
									{valueTypeMap.map((item) => (
										<DropdownMenuRadioItem
											className="cursor-pointer"
											key={item.value}
											value={item.value}
										>
											<ValueTypeIcon valueType={item.value} showTitle />
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
						<div className="flex items-center justify-start w-full ml-2">
							<Input
								name={tree.id}
								key={tree.id}
								placeholder="输入key name"
								className="min-w-32 max-w-32 truncate whitespace-nowrap overflow-hidden text-ellipsis border-none shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
								value={tree.key}
								onFocus={() => onInputFocus(tree)}
							/>
							<TreeValue
								className="inline-block min-w-2xs max-w-full"
								valueType={tree.valueType as ValueType}
								value={tree.value}
								key={tree.id}
								children={tree.children}
								expanded={tree.expanded}
							/>
						</div>
					</div>
					<CollapsibleContent className="ml-4 collapsible-content">
						{tree.children.length > 0 ? <TreeCard key={tree.id} tree={tree.children} onPositionChange={onPositionChange} /> : null}
					</CollapsibleContent>
				</Collapsible>
			</div>
		)
	})
}
export default TreeCard
