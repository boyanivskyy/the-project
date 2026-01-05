import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";
import { Upload } from "lucide-react";

interface UploadFileDialogProps {
	dataroomId: Id<"datarooms">;
	folderId?: Id<"folders"> | null;
	trigger?: React.ReactNode;
}

export function UploadFileDialog({
	dataroomId,
	folderId = null,
	trigger,
}: UploadFileDialogProps) {
	const [open, setOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const createFile = useMutation(api.files.create);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (file.type !== "application/pdf") {
			toast.error("Only PDF files are supported");
			return;
		}

		setUploading(true);
		try {
			// Generate upload URL
			const uploadUrl = await generateUploadUrl();
			console.log("uploadUrl", uploadUrl);

			// Upload file to Convex storage
			const result = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!result.ok) {
				throw new Error("Failed to upload file");
			}

			const storageId = JSON.parse(await result.text())[
				"storageId"
			] as Id<"_storage">;
			console.log("storageId", storageId);

			// Create file record
			await createFile({
				name: file.name,
				dataroomId,
				folderId,
				storageId,
				mimeType: file.type,
				size: file.size,
			});

			toast.success("File uploaded successfully");
			setOpen(false);

			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			toast.error("Failed to upload file");
		} finally {
			setUploading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button disabled={uploading}>
						<Upload className="h-4 w-4 mr-2" />
						Upload PDF
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Upload PDF File</DialogTitle>
					<DialogDescription>
						Select a PDF file to upload. Only PDF files are
						supported.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<input
						ref={fileInputRef}
						type="file"
						accept=".pdf,application/pdf"
						onChange={handleFileSelect}
						disabled={uploading}
						className="w-full"
					/>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={uploading}
					>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
