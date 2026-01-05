import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { type File } from "../../types";

interface FilePreviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	file: File | null;
}

export function FilePreviewDialog({
	open,
	onOpenChange,
	file,
}: FilePreviewDialogProps) {
	const fileUrl = useQuery(
		api.files.getUrl,
		file ? { storageId: file.storageId } : "skip"
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>{file?.name}</DialogTitle>
				</DialogHeader>
				<div className="mt-4">
					{fileUrl ? (
						<iframe
							src={fileUrl}
							className="w-full h-[70vh] border rounded"
							title={file?.name}
						/>
					) : (
						<Skeleton className="w-full h-[70vh]" />
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
