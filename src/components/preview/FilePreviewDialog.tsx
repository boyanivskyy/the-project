import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { type File } from "../../types";

interface FilePreviewDialogProps {
	trigger: (onOpen: (file: File) => void) => React.ReactNode;
}

export function FilePreviewDialog({ trigger }: FilePreviewDialogProps) {
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);

	const onOpen = (file: File) => {
		setFile(file);
		setOpen(true);
	};

	const fileUrl = useQuery(
		api.files.getUrl,
		file ? { storageId: file.storageId } : "skip"
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger(onOpen)}</DialogTrigger>
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
