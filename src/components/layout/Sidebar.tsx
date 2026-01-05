import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "../ui/button";
import { CreateDataroomDialog } from "../dataroom/CreateDataroomDialog";
import { SidebarTreeView } from "./SidebarTreeView";
import { useSidebarState } from "../../hooks/useSidebarState";
import { cn } from "../../lib/utils";

export function Sidebar() {
	const { isCollapsed, toggleCollapsed } = useSidebarState();

	return (
		<aside
			className={cn(
				"bg-background border-r border-border transition-all duration-300 flex flex-col h-full",
				isCollapsed ? "w-[60px]" : "w-[350px]"
			)}
		>
			{/* Toggle Button */}
			<div className="p-2 border-b border-border">
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleCollapsed}
					className="w-full"
				>
					{isCollapsed ? (
						<PanelLeftOpen className="h-5 w-5" />
					) : (
						<PanelLeftClose className="h-5 w-5" />
					)}
				</Button>
			</div>

			{/* Add Dataroom Button - only visible when expanded */}
			{!isCollapsed && (
				<div className="p-2 border-b border-border">
					<CreateDataroomDialog
						trigger={
							<Button className="w-full" size="sm">
								Add Dataroom
							</Button>
						}
					/>
				</div>
			)}

			{/* Tree View */}
			<div className="flex-1 overflow-y-auto">
				{!isCollapsed && <SidebarTreeView />}
			</div>
		</aside>
	);
}
