import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


const TopBar = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
      <div className="font-bold text-lg">小栈 · DevKitto</div>
      <Input placeholder="搜索插件..." className="w-64" />
      <Button variant="ghost">设置</Button>
    </div>
  )
}
export default TopBar