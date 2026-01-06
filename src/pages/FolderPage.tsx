import { useParams } from "react-router";
import { FileExplorer } from "../components/explorer/FileExplorer";
import type { Id } from "../../convex/_generated/dataModel";

export function FolderPage() {
	const { dataroomId, folderId } = useParams<{
		dataroomId: string;
		folderId: string;
	}>();

	// dataroomId and folderId are validated by the route loader, so they're safe to use
	return (
		<FileExplorer
			dataroomId={dataroomId as Id<"datarooms">}
			folderId={folderId as Id<"folders">}
		/>
	);
}
