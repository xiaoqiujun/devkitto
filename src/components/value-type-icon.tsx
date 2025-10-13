import { toPascalCase, toUpperAt, toUpperCase } from "funtool"
import { Ban, Braces, Brackets, CaseSensitive, Pi, SquareCheck, TextIcon, TriangleAlert } from "lucide-react"
import { useMemo } from "react"

export const ValueTypeMap = [
  ["string", "String"],
  ["number", "Number"],
  ["boolean", "Boolean"],
  ["array", "Array"],
  ["object", "Object"],
  ["null", "Null"],
  ["undefined", "Undefined"],
] as const
export type ValueType = (typeof ValueTypeMap)[number][0]

export interface ValueTypeIconProps {
  valueType: ValueType
  showTitle?: boolean
  size?:number
}
const ValueTypeIcon = ({ 
  valueType, 
  showTitle,
  size = 20
 }: ValueTypeIconProps) => {
  const icon = useMemo(() => {
    switch (valueType) {
      case "string":
        return <CaseSensitive className="text-sky-400" size={size} />
      case "number":
        return <Pi className="text-orange-400" size={size} />
      case "boolean":
        return <SquareCheck className="text-green-400" size={size} />
      case "array":
        return <Brackets className="text-yellow-400" size={size} />
      case "object":
        return <Braces className="text-purple-400" size={size} />
      case 'null':
        return <Ban className="text-gray-300" size={size} />
      default:
        return <TriangleAlert className="text-red-400" size={size} />
    }
  }, [valueType, size])

  return (
    <div className="flex items-center justify-start">
      {icon}
      {showTitle && <span className="ml-2">{toPascalCase(valueType)}</span>}
    </div>
  )
}

export default ValueTypeIcon