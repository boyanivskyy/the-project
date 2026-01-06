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
import { useDeleteDialog } from "../../stores/dialogs/useDeleteDialog";
import { toUserMessage } from "../../lib/errors/toUserMessage";

export const DeleteConfirmDialog = () => {
	const { isOpen, payload, close } = useDeleteDialog();

	const handleDelete = async () => {
		if (!payload?.mutation || !payload.id) return;

		try {
			await payload.mutation({ id: payload.id });
			toast.success("Deleted successfully");
			close();
		} catch (error) {
			toast.error(toUserMessage(error, "Failed to delete"));
		}
	};

	const itemCountText = payload?.itemCount
		? ` This will also delete ${payload.itemCount.total} item${payload.itemCount.total !== 1 ? "s" : ""} (${payload.itemCount.folders} folder${payload.itemCount.folders !== 1 ? "s" : ""}, ${payload.itemCount.files} file${payload.itemCount.files !== 1 ? "s" : ""}).`
		: "";

	return (
		<AlertDialog open={isOpen} onOpenChange={close}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{payload?.title || "Delete Item?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{payload?.description ||
							`Are you sure you want to delete "${payload?.name}"?`}
						{itemCountText} This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={close}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
