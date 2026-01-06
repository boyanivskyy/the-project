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
import { useAuth } from "../../features/auth/AuthProvider";

interface FilePreviewDialogProps {
	trigger?: (onOpen: (file: File) => void) => React.ReactNode;
	file?: File;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function FilePreviewDialog({
	trigger,
	file: controlledFile,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: FilePreviewDialogProps) {
	const { user } = useAuth();
	const [internalOpen, setInternalOpen] = useState(false);
	const [internalFile, setInternalFile] = useState<File | null>(null);

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;
	const file = controlledFile ?? internalFile;

	const setOpen = (value: boolean) => {
		if (isControlled) {
			controlledOnOpenChange?.(value);
		} else {
			setInternalOpen(value);
		}
	};

	const onOpen = (fileToOpen: File) => {
		if (isControlled) {
			controlledOnOpenChange?.(true);
		} else {
			setInternalFile(fileToOpen);
			setInternalOpen(true);
		}
	};

	const fileUrl = useQuery(
		api.files.getUrl,
		file && user ? { storageId: file.storageId, userId: user._id } : "skip"
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{trigger && <DialogTrigger asChild>{trigger(onOpen)}</DialogTrigger>}
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
