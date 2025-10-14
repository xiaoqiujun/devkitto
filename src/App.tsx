import { useState } from "react"
import reactLogo from "./assets/react.svg"
import { invoke } from "@tauri-apps/api/core"
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar"
import Sidebar from "./layout/sidebar"
import { routes } from "./routes"
import { Navigate, Route, Routes } from "react-router-dom"

function App() {
	const [greetMsg, setGreetMsg] = useState("")
	const [name, setName] = useState("")

	async function greet() {
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		setGreetMsg(await invoke("greet", { name }))
	}

	return (
		<SidebarProvider>
			<Sidebar routes={routes} />
			<main className="bg-gray-50 relative flex w-full h-[calc(100vh-100px)] overflow-hidden flex-1 flex-col">
				<div className="h-8 flex items-center">
					<SidebarTrigger />
				</div>
				<div className="w-auto h-full">
					<Routes>
						{[
							...routes,
							{
								path: "*",
								element: () => <Navigate to={routes[0].path} replace />,
							},
						].map((route) => (
							<Route key={route.path} path={route.path} element={<route.element />} />
						))}
					</Routes>
				</div>
			</main>
		</SidebarProvider>
	)
}

export default App
