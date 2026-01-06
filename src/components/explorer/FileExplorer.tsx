import { useSearchParams } from "react-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Breadcrumbs } from "./Breadcrumbs";
import { ItemGrid } from "./ItemGrid";
import { EmptyState } from "../shared/EmptyState";
import { FolderPlus, File as FileIcon, Upload } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import type { Id } from "../../../convex/_generated/dataModel";
import { useSafeQuery } from "../../hooks/useSafeQuery";
import { useCreateFolderDialog } from "../../stores/dialogs/useCreateFolderDialog";
import { useUploadFileDialog } from "../../stores/dialogs/useUploadFileDialog";

interface FileExplorerProps {
	dataroomId: Id<"datarooms">;
	folderId?: Id<"folders"> | null;
}

export const FileExplorer = ({ dataroomId, folderId }: FileExplorerProps) => {
	const [searchParams] = useSearchParams();
	const search = searchParams.get("search") || "";

	const createFolderDialog = useCreateFolderDialog();
	const uploadFileDialog = useUploadFileDialog();
	const createFolder = useMutation(api.folders.create);
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const createFile = useMutation(api.files.create);

	const {
		data: folders,
		isLoading: foldersLoading,
		error: foldersError,
	} = useSafeQuery(api.folders.list, {
		dataroomId,
		parentFolderId: folderId || null,
	});

	const {
		data: files,
		isLoading: filesLoading,
		error: filesError,
	} = useSafeQuery(api.files.list, {
		dataroomId,
		folderId: folderId || null,
	});

	if (foldersLoading || filesLoading) {
		return (
			<div>
				<Skeleton className="h-6 w-64 mb-6" />
				<div className="flex flex-col gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-24 w-full" />
					))}
				</div>
			</div>
		);
	}

	// Handle error state - show empty state if there's an error
	if (foldersError || filesError) {
		return (
			<div className="flex flex-col h-full overflow-hidden">
				<Breadcrumbs
					dataroomId={dataroomId}
					folderId={folderId || undefined}
				/>
				<EmptyState
					icon={FileIcon}
					title="Unable to load content"
					description="There was an error loading the files and folders. Please try again."
				/>
			</div>
		);
	}

	// Ensure we have valid data (fallback to empty arrays)
	const safeFolders = folders || [];
	const safeFiles = files || [];

	const filteredFolders = search
		? safeFolders.filter((f) =>
				f.name.toLowerCase().includes(search.toLowerCase())
			)
		: safeFolders;
	const filteredFiles = search
		? safeFiles.filter((f) =>
				f.name.toLowerCase().includes(search.toLowerCase())
			)
		: safeFiles;

	const hasItems = filteredFolders.length > 0 || filteredFiles.length > 0;

	return (
		<div className="flex flex-col h-full overflow-hidden">
			{/* Sticky header section */}
			<div className="shrink-0">
				<Breadcrumbs
					dataroomId={dataroomId}
					folderId={folderId || undefined}
				/>

				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-semibold">
						{search
							? `Search results (${filteredFolders.length + filteredFiles.length})`
							: folderId
								? "Folder Contents"
								: "Files & Folders"}
					</h2>
					<div className="flex gap-2">
						<Button
							onClick={() =>
								createFolderDialog.onOpen({
									dataroomId,
									parentFolderId: folderId || null,
									mutation: (args) => createFolder(args),
								})
							}
						>
							New Folder
						</Button>
						<Button
							onClick={() =>
								uploadFileDialog.onOpen({
									dataroomId,
									folderId: folderId || null,
									generateUploadUrl: () =>
										generateUploadUrl(),
									createFile: (args) => createFile(args),
								})
							}
						>
							<Upload className="h-4 w-4 mr-2" />
							Upload PDF
						</Button>
					</div>
				</div>
			</div>

			{/* Scrollable content area */}
			<div className="flex-1 overflow-y-auto">
				{hasItems ? (
					<ItemGrid
						folders={filteredFolders}
						files={filteredFiles}
						dataroomId={dataroomId}
					/>
				) : (
					<EmptyState
						icon={search ? FileIcon : FolderPlus}
						title={
							search ? "No items found" : "This folder is empty"
						}
						description={
							search
								? `No folders or files match "${search}"`
								: "Create a folder or upload a file to get started"
						}
						action={
							!search ? (
								<div className="flex gap-2">
									<button
										onClick={() =>
											createFolderDialog.onOpen({
												dataroomId,
												parentFolderId:
													folderId || null,
												mutation: (args) =>
													createFolder(args),
											})
										}
										className="text-primary hover:underline"
									>
										Create folder
									</button>
									<span className="text-muted-foreground">
										or
									</span>
									<button
										onClick={() =>
											uploadFileDialog.onOpen({
												dataroomId,
												folderId: folderId || null,
												generateUploadUrl: () =>
													generateUploadUrl(),
												createFile: (args) =>
													createFile(args),
											})
										}
										className="text-primary hover:underline"
									>
										Upload file
									</button>
								</div>
							) : null
						}
					/>
				)}
			</div>
		</div>
	);
};
