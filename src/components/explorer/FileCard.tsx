import { File, MoreVertical } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "../ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { FilePreviewDialog } from "../preview/FilePreviewDialog";
import { type File as FileType } from "../../types";
import { formatFileSize } from "../../lib/validation";
import { useRenameDialog } from "../../stores/dialogs/useRenameDialog";
import { useDeleteDialog } from "../../stores/dialogs/useDeleteDialog";
import type { Id } from "../../../convex/_generated/dataModel";

interface FileCardProps {
	file: FileType;
}

export function FileCard({ file }: FileCardProps) {
	const renameDialog = useRenameDialog();
	const deleteDialog = useDeleteDialog();
	const updateFile = useMutation(api.files.update);
	const deleteFile = useMutation(api.files.remove);

	return (
		<Card className="p-4 hover:shadow-md transition-shadow group">
			<div className="flex items-center gap-4">
				<FilePreviewDialog
					trigger={(onOpen) => (
						<button
							onClick={() => onOpen(file)}
							className="flex-1 flex items-center gap-4 min-w-0 text-left"
						>
							<div className="p-3 bg-destructive/10 rounded-lg shrink-0">
								<File className="h-6 w-6 text-destructive" />
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-medium truncate">
									{file.name}
								</h3>
								<p className="text-xs text-muted-foreground">
									{formatFileSize(file.size)} •{" "}
									{new Date(file.createdAt).toLocaleString()}
								</p>
							</div>
						</button>
					)}
				/>
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
						<FilePreviewDialog
							trigger={(onOpen) => (
								<DropdownMenuItem onClick={() => onOpen(file)}>
									Preview
								</DropdownMenuItem>
							)}
						/>
						<DropdownMenuItem
							onClick={() =>
								renameDialog.onOpen({
									id: file._id,
									name: file.name,
									mutation: (args: {
										id: Id<"files">;
										name: string;
									}) => updateFile(args),
								})
							}
						>
							Rename
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								deleteDialog.onOpen({
									id: file._id,
									name: file.name,
									mutation: (args: { id: Id<"files"> }) =>
										deleteFile(args),
									title: "Delete File?",
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
