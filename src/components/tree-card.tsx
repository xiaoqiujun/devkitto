import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { JsonTree } from "@/hooks/use-json-line-map"
import { useEffect, useMemo, useState } from "react"
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
interface TreeValueProps extends JsonTree {
	className?: string
}
const TreeValue = ({ valueType, value, children, expanded, className = "" }: TreeValueProps) => {
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

export interface TreeCardHandle {
	onPosition?: (lineNumber: number, column: number) => void
	onKeyFocus?: (item: JsonTree) => void
	onOpenChange?: (item: JsonTree, open: boolean) => void
	onValueChange?: (value: any) => void
}

export interface TreeCardProps extends TreeCardHandle {
	tree: JsonTree[]
}
const TreeCard = ({ tree, onPosition, onOpenChange, onValueChange }: TreeCardProps) => {
	
	return (
		<div className="tree relative flex flex-col w-full bg-gray-50 rounded-xs gap-3">
			{tree.map((child) => {
				return (
					<TreeCardItem
						key={child.id}
						{...child}
						onPosition={onPosition}
						onOpenChange={onOpenChange}
						onValueChange={onValueChange}
					/>
				)
			})}
		</div>
	)
}

export interface TreeCardItemProps extends JsonTree, TreeCardHandle {
	className?: string
}
const TreeCardItem = ({ onPosition, onOpenChange, className = "", ...item }: TreeCardItemProps) => {
	const [open, setOpen] = useState(false)
	const onKeyFocus = (item: JsonTree) => {
		onPosition?.(item.startLine, 1)
	}

	if (!item.children.length) {
		return <TreeHeader {...item} onKeyFocus={onKeyFocus} />
	}
	return (
		<div className={cn("tree relative flex w-full bg-slate-200/50 rounded-md", className)} key={item.id}>
			{/* {tree.level > 0 ? <div className="absolute top-0 left-3 h-full w-[1px] bg-slate-400"></div> : null} */}
			<Collapsible open={item.expanded} onOpenChange={() => onOpenChange?.(item, !item.expanded)} className={cn("w-full px-3 pb-2.5")}>
				<TreeHeader {...item} onKeyFocus={onKeyFocus} onOpenChange={onOpenChange} />
				<CollapsibleContent className="py-2.5 px-3 rounded-md collapsible-content overflow-hidden flex flex-col items-start gap-3 bg-gray-50">
					{/* <div className="overflow-auto max-h-[calc(100vh-120px)]">
						
					</div> */}
					{item.children?.map((child) => {
						return <TreeCardItem {...child} key={child.id} onPosition={onPosition} onOpenChange={onOpenChange} />
					})}
				</CollapsibleContent>
			</Collapsible>
		</div>
	)
}
interface TreeHeaderProps extends JsonTree, TreeCardHandle {}
/**
 * 树节点头
 * @param param0
 * @returns
 */
const TreeHeader = ({ onPosition, onKeyFocus, onOpenChange, ...item }: TreeHeaderProps) => {
	const valueTypeMap = ValueTypeMap.map(([value, label]) => {
		return {
			value: value,
			label: label,
		}
	})
	return (
		<div
			className={cn(
				"flex items-center justify-start w-full max-w-full py-2.5 rounded-md",
				!item.children.length ? "px-3 bg-slate-200/50" : "pb-0"
			)}
		>
			<div className="trigger flex items-center justify-center">
				{item.children?.length > 0 ? (
					<CollapsibleTrigger asChild>
						<div className="group cursor-pointer" onClick={() => onOpenChange?.(item, !item.expanded)}>
							<TreeArrow />
						</div>
					</CollapsibleTrigger>
				) : null}
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<div className="cursor-pointer">
							<ValueTypeIcon valueType={item.valueType as ValueType} />
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuRadioGroup value={item.valueType as ValueType}>
							{valueTypeMap.map((item) => (
								<DropdownMenuRadioItem className="cursor-pointer" key={item.value} value={item.value}>
									<ValueTypeIcon valueType={item.value} showTitle />
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="flex flex-1 items-center justify-between ml-2">
				<div className="flex items-center justify-start">
					<Input
						name={item.id}
						placeholder="输入key name"
						className="min-w-32 max-w-32 truncate whitespace-nowrap overflow-hidden text-ellipsis border-none shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
						value={item.name}
						onFocus={() => onKeyFocus(item)}
					/>
					<TreeValue className="inline-block min-w-2xs max-w-full" {...item} />
				</div>
				{["object", "array"].includes(item.valueType) ? (
					<div className="action">
						<Button variant="ghost" className="px-2.5">
							<Plus />
						</Button>
					</div>
				) : null}
			</div>
		</div>
	)
}
export default TreeCard
