import { useLoaderData } from "react-router";
import { FileExplorer } from "../features/explorer/components/FileExplorer";
import type { Id } from "../../convex/_generated/dataModel";

export function FolderPage() {
	const { dataroomId, folderId } = useLoaderData<{
		dataroomId: Id<"datarooms">;
		folderId: Id<"folders">;
	}>();

	return <FileExplorer dataroomId={dataroomId} folderId={folderId} />;
}
