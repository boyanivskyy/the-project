import { Plus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { SidebarTreeView } from "./SidebarTreeView";
import { useCreateDataroomDialog } from "../../stores/dialogs/useCreateDataroomDialog";

export function Sidebar() {
	const createDataroomDialog = useCreateDataroomDialog();
	const createDataroom = useMutation(api.datarooms.create);

	return (
		<aside className="bg-background border-r border-border flex flex-col h-full w-[300px]">
			{/* Tree View - scrollable */}
			<div className="flex-1 overflow-y-auto">
				<SidebarTreeView />
			</div>

			{/* Add Dataroom Button - sticky at bottom */}
			<div className="p-3 border-t border-border shrink-0 bg-background">
				<Button
					className="w-full"
					size="default"
					onClick={() =>
						createDataroomDialog.onOpen({
							mutation: (args) => createDataroom(args),
						})
					}
				>
					<Plus className="size-4" />
					Add Dataroom
				</Button>
			</div>
		</aside>
	);
}
