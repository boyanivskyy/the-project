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

export const DeleteConfirmDialog = () => {
	const { isOpen, initialValues, onClose } = useDeleteDialog();

	const handleDelete = async () => {
		if (!initialValues.mutation || !initialValues.id) return;

		try {
			await initialValues.mutation({ id: initialValues.id });
			toast.success("Deleted successfully");
			onClose();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete"
			);
		}
	};

	const itemCountText = initialValues.itemCount
		? ` This will also delete ${initialValues.itemCount.total} item${initialValues.itemCount.total !== 1 ? "s" : ""} (${initialValues.itemCount.folders} folder${initialValues.itemCount.folders !== 1 ? "s" : ""}, ${initialValues.itemCount.files} file${initialValues.itemCount.files !== 1 ? "s" : ""}).`
		: "";

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{initialValues.title || "Delete Item?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{initialValues.description ||
							`Are you sure you want to delete "${initialValues.name}"?`}
						{itemCountText} This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
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
