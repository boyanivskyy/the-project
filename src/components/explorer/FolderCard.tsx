import { Link } from "react-router";
import { Folder, MoreVertical } from "lucide-react";
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
import { type Folder as FolderType } from "../../types";
import type { Id } from "../../../convex/_generated/dataModel";
import { useRenameDialog } from "../../stores/dialogs/useRenameDialog";
import { useDeleteDialog } from "../../stores/dialogs/useDeleteDialog";
import { useAuth } from "../../providers/AuthProvider";

interface FolderCardProps {
	folder: FolderType;
	dataroomId: Id<"datarooms">;
}

export function FolderCard({ folder, dataroomId }: FolderCardProps) {
	const { user } = useAuth();
	const renameDialog = useRenameDialog();
	const deleteDialog = useDeleteDialog();
	const updateFolder = useMutation(api.folders.update);
	const deleteFolder = useMutation(api.folders.remove);
	const itemCount = useQuery(
		api.folders.getItemCount,
		user ? { id: folder._id, userId: user._id } : "skip"
	);

	return (
		<Card className="p-4 hover:shadow-md transition-shadow group">
			<div className="flex items-center gap-4">
				<Link
					to={`/dataroom/${dataroomId}/folder/${folder._id}`}
					className="flex-1 flex items-center gap-4 min-w-0"
				>
					<div className="p-3 bg-primary/10 rounded-lg shrink-0">
						<Folder className="h-6 w-6 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-medium truncate">{folder.name}</h3>
						<p className="text-xs text-muted-foreground">
							{new Date(folder.createdAt).toLocaleDateString()}
						</p>
					</div>
				</Link>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="opacity-0 group-hover:opacity-100 transition-opacity"
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={() =>
							renameDialog.onOpen({
								id: folder._id,
								name: folder.name,
								mutation: (args: {
									id: Id<"folders">;
									name: string;
								}) => updateFolder({ ...args, userId: user!._id }),
							})
						}
					>
						Rename
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() =>
							deleteDialog.onOpen({
								id: folder._id,
								name: folder.name,
								mutation: (args: { id: Id<"folders"> }) =>
									deleteFolder({ ...args, userId: user!._id }),
								itemCount: itemCount,
								title: "Delete Folder?",
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
}
