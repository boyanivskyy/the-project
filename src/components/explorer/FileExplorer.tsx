import { useState } from "react";
import { useQuery } from "convex/react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { Breadcrumbs } from "./Breadcrumbs";
import { ItemGrid } from "./ItemGrid";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { UploadFileDialog } from "./UploadFileDialog";
import { RenameDialog } from "./RenameDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { FilePreviewDialog } from "../preview/FilePreviewDialog";
import { EmptyState } from "../shared/EmptyState";
import { FolderPlus, Upload, File as FileIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Id } from "../../../convex/_generated/dataModel";
import { type Folder, type File } from "../../types";

interface FileExplorerProps {
	dataroomId: Id<"datarooms">;
	folderId?: Id<"folders"> | null;
}

export function FileExplorer({ dataroomId, folderId }: FileExplorerProps) {
	const [searchParams] = useSearchParams();
	const search = searchParams.get("search") || "";
	const [renameItem, setRenameItem] = useState<Folder | File | null>(null);
	const [deleteItem, setDeleteItem] = useState<Folder | File | null>(null);
	const [previewFile, setPreviewFile] = useState<File | null>(null);
	const [renameType, setRenameType] = useState<"folder" | "file">("folder");
	const [deleteType, setDeleteType] = useState<"folder" | "file">("folder");

	const folders = useQuery(api.folders.list, {
		dataroomId,
		parentFolderId: folderId || null,
	});
	const files = useQuery(api.files.list, {
		dataroomId,
		folderId: folderId || null,
	});

	if (folders === undefined || files === undefined) {
		return (
			<div>
				<Skeleton className="h-6 w-64 mb-6" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-24" />
					))}
				</div>
			</div>
		);
	}

	const filteredFolders = search
		? folders.filter((f) =>
				f.name.toLowerCase().includes(search.toLowerCase())
			)
		: folders;
	const filteredFiles = search
		? files.filter((f) =>
				f.name.toLowerCase().includes(search.toLowerCase())
			)
		: files;

	const hasItems = filteredFolders.length > 0 || filteredFiles.length > 0;

	return (
		<div>
			<Breadcrumbs dataroomId={dataroomId} folderId={folderId || undefined} />

			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-semibold">
					{search
						? `Search results (${filteredFolders.length + filteredFiles.length})`
						: folderId
							? "Folder Contents"
							: "Files & Folders"}
				</h2>
				<div className="flex gap-2">
					<CreateFolderDialog
						dataroomId={dataroomId}
						parentFolderId={folderId || null}
					/>
					<UploadFileDialog
						dataroomId={dataroomId}
						folderId={folderId || null}
					/>
				</div>
			</div>

			{hasItems ? (
				<ItemGrid
					folders={filteredFolders}
					files={filteredFiles}
					dataroomId={dataroomId}
					onFolderRename={(folder) => {
						setRenameItem(folder);
						setRenameType("folder");
					}}
					onFolderDelete={(folder) => {
						setDeleteItem(folder);
						setDeleteType("folder");
					}}
					onFilePreview={(file) => {
						setPreviewFile(file);
					}}
					onFileRename={(file) => {
						setRenameItem(file);
						setRenameType("file");
					}}
					onFileDelete={(file) => {
						setDeleteItem(file);
						setDeleteType("file");
					}}
				/>
			) : (
				<EmptyState
					icon={search ? FileIcon : FolderPlus}
					title={search ? "No items found" : "This folder is empty"}
					description={
						search
							? `No folders or files match "${search}"`
							: "Create a folder or upload a file to get started"
					}
					action={
						!search ? (
							<div className="flex gap-2">
								<CreateFolderDialog
									dataroomId={dataroomId}
									parentFolderId={folderId || null}
									trigger={
										<button className="text-primary hover:underline">
											Create folder
										</button>
									}
								/>
								<span className="text-muted-foreground">or</span>
								<UploadFileDialog
									dataroomId={dataroomId}
									folderId={folderId || null}
									trigger={
										<button className="text-primary hover:underline">
											Upload file
										</button>
									}
								/>
							</div>
						) : null
					}
				/>
			)}

			<RenameDialog
				open={renameItem !== null}
				onOpenChange={(open) => !open && setRenameItem(null)}
				item={renameItem}
				type={renameType}
			/>

			<DeleteConfirmDialog
				open={deleteItem !== null}
				onOpenChange={(open) => !open && setDeleteItem(null)}
				item={deleteItem}
				type={deleteType}
			/>

			<FilePreviewDialog
				open={previewFile !== null}
				onOpenChange={(open) => !open && setPreviewFile(null)}
				file={previewFile}
			/>
		</div>
	);
}
