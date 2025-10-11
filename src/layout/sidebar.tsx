import {
	Sidebar as SidebarComponent,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Route } from "@/routes";
import { Ampersand, Calendar, Home, Inbox, LucideProps, Search, Settings } from "lucide-react"
import { useState } from "react";

// const items = [
// 	{
// 		title: "Base64 转换",
// 		url: "/base64-converter",
// 		icon: Ampersand,
// 	},
// 	{
// 		title: "Inbox",
// 		url: "#",
// 		icon: Inbox,
// 	},
// 	{
// 		title: "Calendar",
// 		url: "#",
// 		icon: Calendar,
// 	},
// 	{
// 		title: "Search",
// 		url: "#",
// 		icon: Search,
// 	},
// 	{
// 		title: "Settings",
// 		url: "#",
// 		icon: Settings,
// 	},
// ]
type SidebarItem = {
	title: string;
	url: string;
	icon: React.FC<LucideProps>;
}
const Sidebar = ({
	routes,
}: {
	routes: Route[];
}) => {
	const [items, setItems] = useState<SidebarItem[]>(routes.map((item) => ({
		title: item.label,
		url: item.path,
		icon: item.icon,
	})));
	return (
		<SidebarComponent collapsible="icon">
      <SidebarHeader />
			<SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
		</SidebarComponent>
	)
}
export default Sidebar
