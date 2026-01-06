import { Link } from "react-router";
import { Database, MoreVertical } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "../ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { type Dataroom } from "../../types";
import type { Id } from "../../../convex/_generated/dataModel";
import { useRenameDialog } from "../../stores/dialogs/useRenameDialog";
import { useDeleteDialog } from "../../stores/dialogs/useDeleteDialog";

interface DataroomCardProps {
	dataroom: Dataroom;
}

export const DataroomCard = ({ dataroom }: DataroomCardProps) => {
	const renameDialog = useRenameDialog();
	const deleteDialog = useDeleteDialog();
	const updateDataroom = useMutation(api.datarooms.update);
	const deleteDataroom = useMutation(api.datarooms.remove);
	const itemCount = useQuery(api.datarooms.getItemCount, {
		id: dataroom._id,
	});

	return (
		<Card className="p-6 hover:shadow-md transition-shadow h-full flex flex-col group">
			<div className="flex items-center gap-4">
				<Link
					to={`/dataroom/${dataroom._id}`}
					className="flex-1 flex items-center gap-4 min-w-0"
				>
					<div className="p-3 bg-primary/10 rounded-lg">
						<Database className="h-6 w-6 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-lg truncate">
							{dataroom.name}
						</h3>
						<p className="text-sm text-muted-foreground">
							{new Date(dataroom.createdAt).toLocaleDateString()}
						</p>
					</div>
				</Link>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={(e) => e.stopPropagation()}
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() =>
								renameDialog.onOpen({
									id: dataroom._id,
									name: dataroom.name,
									mutation: (args: {
										id: Id<"datarooms">;
										name: string;
									}) => updateDataroom(args),
								})
							}
						>
							Rename
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								deleteDialog.onOpen({
									id: dataroom._id,
									name: dataroom.name,
									mutation: (args: { id: Id<"datarooms"> }) =>
										deleteDataroom(args),
									itemCount: itemCount,
									title: "Delete Dataroom?",
								})
							}
							className="text-destructive"
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</Card>
	);
};
