import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";
import { type Folder, type File } from "../../../types";
import type { Id } from "../../../../convex/_generated/dataModel";

interface ItemGridProps {
	folders: Folder[];
	files: File[];
	dataroomId: Id<"datarooms">;
}

export function ItemGrid({ folders, files, dataroomId }: ItemGridProps) {
	if (folders.length === 0 && files.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-4">
			{folders.map((folder) => (
				<FolderCard
					key={folder._id}
					folder={folder}
					dataroomId={dataroomId}
				/>
			))}
			{files.map((file) => (
				<FileCard key={file._id} file={file} />
			))}
		</div>
	);
}
