import { useState, useRef } from "react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";
import { useUploadFileDialog } from "../../stores/dialogs/useUploadFileDialog";

export function UploadFileDialog() {
	const { isOpen, initialValues, onClose } = useUploadFileDialog();
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (
			!initialValues.generateUploadUrl ||
			!initialValues.createFile ||
			!initialValues.dataroomId
		)
			return;

		// Validate file type
		if (file.type !== "application/pdf") {
			toast.error("Only PDF files are supported");
			return;
		}

		setUploading(true);
		try {
			// Generate upload URL
			const uploadUrl = await initialValues.generateUploadUrl();

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

			// Create file record
			await initialValues.createFile({
				name: file.name,
				dataroomId: initialValues.dataroomId,
				folderId: initialValues.folderId,
				storageId,
				mimeType: file.type,
				size: file.size,
			});

			toast.success("File uploaded successfully");
			onClose();

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
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{initialValues.title || "Upload PDF File"}
					</DialogTitle>
					<DialogDescription>
						{initialValues.description ||
							"Select a PDF file to upload. Only PDF files are supported."}
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
						onClick={onClose}
						disabled={uploading}
					>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
