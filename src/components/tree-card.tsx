import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const TreeCard = ({ data }) => {
  return (
    <Card className="p-2">
      <Collapsible>
        <CollapsibleTrigger>{data.title}</CollapsibleTrigger>
        <CollapsibleContent className="ml-4">
          {data.children?.map(child => (
            <TreeCard key={child.id} data={child} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
export default TreeCard