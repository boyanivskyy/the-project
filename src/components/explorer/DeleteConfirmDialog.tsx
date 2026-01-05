import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import { type Folder, type File } from "../../types";

interface DeleteConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: Folder | File | null;
	type: "folder" | "file";
}

export function DeleteConfirmDialog({
	open,
	onOpenChange,
	item,
	type,
}: DeleteConfirmDialogProps) {
	const deleteFolder = useMutation(api.folders.remove);
	const deleteFile = useMutation(api.files.remove);
	const itemCount = useQuery(
		api.folders.getItemCount,
		type === "folder" && item ? { id: item._id } : "skip"
	);

	const handleDelete = async () => {
		if (!item) return;

		try {
			if (type === "folder") {
				await deleteFolder({ id: item._id });
			} else {
				await deleteFile({ id: item._id });
			}
			toast.success(`${type === "folder" ? "Folder" : "File"} deleted successfully`);
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : `Failed to delete ${type}`
			);
		}
	};

	const itemCountText =
		type === "folder" && itemCount
			? ` This will also delete ${itemCount.total} item${itemCount.total !== 1 ? "s" : ""} (${itemCount.folders} folder${itemCount.folders !== 1 ? "s" : ""}, ${itemCount.files} file${itemCount.files !== 1 ? "s" : ""}).`
			: "";

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Delete {type === "folder" ? "Folder" : "File"}?
					</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete "{item?.name}"?{itemCountText}
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
