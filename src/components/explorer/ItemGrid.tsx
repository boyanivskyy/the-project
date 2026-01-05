import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";
import { type Folder, type File } from "../../types";
import { Id } from "../../../convex/_generated/dataModel";

interface ItemGridProps {
	folders: Folder[];
	files: File[];
	dataroomId: Id<"datarooms">;
	onFolderRename: (folder: Folder) => void;
	onFolderDelete: (folder: Folder) => void;
	onFilePreview: (file: File) => void;
	onFileRename: (file: File) => void;
	onFileDelete: (file: File) => void;
}

export function ItemGrid({
	folders,
	files,
	dataroomId,
	onFolderRename,
	onFolderDelete,
	onFilePreview,
	onFileRename,
	onFileDelete,
}: ItemGridProps) {
	if (folders.length === 0 && files.length === 0) {
		return null;
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{folders.map((folder) => (
				<FolderCard
					key={folder._id}
					folder={folder}
					dataroomId={dataroomId}
					onRename={() => onFolderRename(folder)}
					onDelete={() => onFolderDelete(folder)}
				/>
			))}
			{files.map((file) => (
				<FileCard
					key={file._id}
					file={file}
					onPreview={() => onFilePreview(file)}
					onRename={() => onFileRename(file)}
					onDelete={() => onFileDelete(file)}
				/>
			))}
		</div>
	);
}
