import { useState, useRef, useCallback } from "react";
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
import { toUserMessage } from "../../lib/errors/toUserMessage";
import {
	Upload,
	File,
	X,
	CheckCircle2,
	Loader2,
	AlertCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";

type FileStatus = "pending" | "uploading" | "uploaded" | "error";

interface FileWithStatus {
	file: File;
	status: FileStatus;
	error?: string;
}

export function UploadFileDialog() {
	const { isOpen, payload, close } = useUploadFileDialog();
	const [files, setFiles] = useState<FileWithStatus[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const uploadFile = useCallback(
		async (
			fileWithStatus: FileWithStatus
		): Promise<{ success: boolean; fileName: string }> => {
			if (
				!payload?.generateUploadUrl ||
				!payload.createFile ||
				!payload.dataroomId
			) {
				return { success: false, fileName: fileWithStatus.file.name };
			}

			const file = fileWithStatus.file;

			// Update status to uploading
			setFiles((prev) =>
				prev.map((f) =>
					f.file === file
						? { ...f, status: "uploading" as FileStatus }
						: f
				)
			);

			try {
				// Generate upload URL
				const uploadUrl = await payload.generateUploadUrl();

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
				await payload.createFile({
					name: file.name,
					dataroomId: payload.dataroomId,
					folderId: payload.folderId || null,
					storageId,
					mimeType: file.type,
					size: file.size,
				});

				// Update status to uploaded
				setFiles((prev) =>
					prev.map((f) =>
						f.file === file
							? { ...f, status: "uploaded" as FileStatus }
							: f
					)
				);

				return { success: true, fileName: file.name };
			} catch (error) {
				const errorMessage = toUserMessage(
					error,
					"Failed to upload file"
				);
				// Update status to error
				setFiles((prev) =>
					prev.map((f) =>
						f.file === file
							? {
									...f,
									status: "error" as FileStatus,
									error: errorMessage,
								}
							: f
					)
				);
				toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
				return { success: false, fileName: file.name };
			}
		},
		[payload]
	);

	const handleUploadAll = useCallback(async () => {
		if (!payload) return;

		// Get current pending files using a ref-like pattern
		let pendingFiles: FileWithStatus[] = [];
		setFiles((currentFiles) => {
			pendingFiles = currentFiles.filter((f) => f.status === "pending");
			return currentFiles;
		});

		if (pendingFiles.length === 0) {
			toast.info("All files have been uploaded");
			return;
		}

		setIsUploading(true);

		// Upload all pending files in parallel
		const results = await Promise.all(
			pendingFiles.map((f) => uploadFile(f))
		);

		setIsUploading(false);

		// Count successes and failures
		const successCount = results.filter((r) => r.success).length;
		const failureCount = results.filter((r) => !r.success).length;

		if (successCount > 0) {
			toast.success(
				`${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully${failureCount > 0 ? `, ${failureCount} failed` : ""}`
			);
		}
	}, [payload, uploadFile]);

	const validateAndAddFiles = useCallback(
		(fileList: FileList) => {
			const newFiles: FileWithStatus[] = [];
			const invalidFiles: string[] = [];

			Array.from(fileList).forEach((file) => {
				if (file.type !== "application/pdf") {
					invalidFiles.push(file.name);
					return;
				}

				// Check if file already exists
				const exists = files.some(
					(f) =>
						f.file.name === file.name && f.file.size === file.size
				);
				if (!exists) {
					newFiles.push({ file, status: "pending" });
				}
			});

			if (invalidFiles.length > 0) {
				toast.error(
					`${invalidFiles.length} file${invalidFiles.length > 1 ? "s" : ""} not PDF: ${invalidFiles.join(", ")}`
				);
			}

			if (newFiles.length > 0) {
				setFiles((prev) => [...prev, ...newFiles]);
			}
		},
		[files]
	);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const fileList = e.target.files;
		if (!fileList || fileList.length === 0) return;
		validateAndAddFiles(fileList);

		// Reset input so same files can be selected again
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);

			const fileList = e.dataTransfer.files;
			if (!fileList || fileList.length === 0) return;

			validateAndAddFiles(fileList);
		},
		[validateAndAddFiles]
	);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);
		},
		[]
	);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleRemoveFile = (fileToRemove: File) => {
		setFiles((prev) => prev.filter((f) => f.file !== fileToRemove));
	};

	const handleClose = () => {
		setFiles([]);
		setIsDragging(false);
		setIsUploading(false);
		close();
	};

	const getStatusIcon = (status: FileStatus) => {
		switch (status) {
			case "uploading":
				return (
					<Loader2 className="h-4 w-4 animate-spin text-primary" />
				);
			case "uploaded":
				return <CheckCircle2 className="h-4 w-4 text-green-600" />;
			case "error":
				return <AlertCircle className="h-4 w-4 text-destructive" />;
			default:
				return null;
		}
	};

	const pendingCount = files.filter((f) => f.status === "pending").length;
	const uploadedCount = files.filter((f) => f.status === "uploaded").length;
	const hasFiles = files.length > 0;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{payload?.title || "Upload PDF Files"}
					</DialogTitle>
					<DialogDescription>
						{payload?.description ||
							"Select PDF files to upload. You can upload multiple files at once."}
					</DialogDescription>
				</DialogHeader>
				<div className="py-4 space-y-4">
					<input
						ref={fileInputRef}
						type="file"
						accept=".pdf,application/pdf"
						multiple
						onChange={handleFileSelect}
						disabled={isUploading}
						className="hidden"
					/>

					<div
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onClick={handleClick}
						className={cn(
							"relative flex items-center gap-3 p-4 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
							isDragging
								? "border-primary bg-primary/5"
								: "border-input hover:border-primary/50 hover:bg-accent/50",
							isUploading &&
								"opacity-50 cursor-not-allowed pointer-events-none"
						)}
					>
						<div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary shrink-0">
							<Upload className="h-5 w-5" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium">
								{isDragging
									? "Drop your PDF files here"
									: "Click to upload or drag and drop"}
							</p>
							<p className="text-xs text-muted-foreground">
								PDF files only • Multiple files supported
							</p>
						</div>
					</div>

					{hasFiles && (
						<div className="space-y-2 max-h-64 overflow-y-auto">
							<div className="text-sm font-medium text-muted-foreground mb-2">
								{files.length} file{files.length > 1 ? "s" : ""}{" "}
								selected
								{pendingCount > 0 &&
									` • ${pendingCount} pending`}
								{uploadedCount > 0 &&
									` • ${uploadedCount} uploaded`}
							</div>
							{files.map((fileWithStatus, index) => (
								<div
									key={`${fileWithStatus.file.name}-${index}`}
									className={cn(
										"flex items-center gap-3 p-3 rounded-lg border bg-card",
										fileWithStatus.status === "uploaded" &&
											"border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900",
										fileWithStatus.status === "error" &&
											"border-destructive/50 bg-destructive/5"
									)}
								>
									<div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary shrink-0">
										{getStatusIcon(
											fileWithStatus.status
										) || <File className="h-5 w-5" />}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">
											{fileWithStatus.file.name}
										</p>
										<p className="text-xs text-muted-foreground">
											{(
												fileWithStatus.file.size / 1024
											).toFixed(2)}{" "}
											KB
											{fileWithStatus.status ===
												"error" &&
												fileWithStatus.error && (
													<span className="text-destructive ml-2">
														• {fileWithStatus.error}
													</span>
												)}
										</p>
									</div>
									{fileWithStatus.status !== "uploading" && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() =>
												handleRemoveFile(
													fileWithStatus.file
												)
											}
											disabled={isUploading}
											className="shrink-0"
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
						</div>
					)}
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						disabled={isUploading}
					>
						{hasFiles && uploadedCount > 0 ? "Done" : "Cancel"}
					</Button>
					{hasFiles && pendingCount > 0 && (
						<Button
							type="button"
							onClick={handleUploadAll}
							disabled={isUploading || pendingCount === 0}
						>
							{isUploading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Uploading...
								</>
							) : (
								`Upload ${pendingCount} file${pendingCount > 1 ? "s" : ""}`
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
