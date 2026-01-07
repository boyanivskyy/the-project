import { Breadcrumbs } from "./Breadcrumbs";
import { ItemGrid } from "./ItemGrid";
import { EmptyState } from "../../../components/shared/EmptyState";
import { LoadingList } from "../../../components/shared/LoadingList";
import { PageTitleBar } from "../../../components/shared/PageTitleBar";
import { FolderPlus, File as FileIcon, Upload } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "../../auth/AuthProvider";
import { useExplorerItems } from "../hooks/useExplorerItems";

interface FileExplorerProps {
	dataroomId: Id<"datarooms">;
	folderId?: Id<"folders"> | null;
}

export const FileExplorer = ({ dataroomId, folderId }: FileExplorerProps) => {
	const { user } = useAuth();

	const { isLoading, error, folders, files, hasItems, actions } =
		useExplorerItems({
			userId: user?._id ?? null,
			dataroomId,
			folderId,
		});

	if (!user) {
		return null;
	}

	if (isLoading) {
		return <LoadingList headerHeight="h-6" />;
	}

	// Handle error state - show empty state if there's an error
	if (error) {
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

	return (
		<div className="flex flex-col h-full overflow-hidden">
			{/* Sticky header section */}
			<div className="shrink-0">
				<Breadcrumbs
					dataroomId={dataroomId}
					folderId={folderId || undefined}
				/>

				<PageTitleBar
					title={folderId ? "Folder Contents" : "Files & Folders"}
					actions={
						<>
							<Button onClick={actions.openCreateFolderDialog}>
								New Folder
							</Button>
							<Button onClick={actions.openUploadFileDialog}>
								<Upload className="h-4 w-4 mr-2" />
								Upload PDF
							</Button>
						</>
					}
				/>
			</div>

			{/* Scrollable content area */}
			<div className="flex-1 overflow-y-auto">
				{hasItems ? (
					<ItemGrid
						folders={folders}
						files={files}
						dataroomId={dataroomId}
					/>
				) : (
					<EmptyState
						icon={FolderPlus}
						title="This folder is empty"
						description="Create a folder or upload a file to get started"
						action={
							<div className="flex gap-2">
								<button
									onClick={actions.openCreateFolderDialog}
									className="text-primary hover:underline"
								>
									Create folder
								</button>
								<span className="text-muted-foreground">
									or
								</span>
								<button
									onClick={actions.openUploadFileDialog}
									className="text-primary hover:underline"
								>
									Upload file
								</button>
							</div>
						}
					/>
				)}
			</div>
		</div>
	);
};
