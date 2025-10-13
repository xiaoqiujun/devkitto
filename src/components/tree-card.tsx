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

const TreeArrow = ({
	size = 14,
	className = "",
}: {
	size?: number
	className?: string
}) => {
	return (
		<svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`
        text-gray-500 transition-transform duration-200 ease-in-out
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

export interface TreeCardProps {
	tree: JsonTree[]
}
const TreeCard = ({ tree }: TreeCardProps) => {
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
	return (treeData || []).map((tree) => {
		return (
			<div className="json-tree p-3" key={tree.id}>
				<Collapsible className="rounded-xs py-2.5 px-3.5 bg-slate-200">
					<div className="flex items-center justify-start">
						<CollapsibleTrigger asChild>
							<div className="cursor-pointer">
								<TreeArrow />
							</div>
						</CollapsibleTrigger>
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
						<label className="ml-2">{tree.key}</label>
					</div>
					<CollapsibleContent className="ml-4">
						{tree.children.length > 0 ? <TreeCard key={tree.id} tree={tree.children} /> : null}
					</CollapsibleContent>
				</Collapsible>
			</div>
		)
	})
}
export default TreeCard
