import { useParams } from "react-router-dom";
import { FileExplorer } from "../components/explorer/FileExplorer";
import { Id } from "../../convex/_generated/dataModel";

export function FolderPage() {
	const { dataroomId, folderId } = useParams<{
		dataroomId: string;
		folderId: string;
	}>();
	if (!dataroomId || !folderId) return null;

	return (
		<FileExplorer
			dataroomId={dataroomId as Id<"datarooms">}
			folderId={folderId as Id<"folders">}
		/>
	);
}
