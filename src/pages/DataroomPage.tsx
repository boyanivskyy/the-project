import { useLoaderData } from "react-router";
import { FileExplorer } from "../features/explorer/components/FileExplorer";
import type { Id } from "../../convex/_generated/dataModel";

export function DataroomPage() {
	const { dataroomId } = useLoaderData<{ dataroomId: Id<"datarooms"> }>();

	return <FileExplorer dataroomId={dataroomId} />;
}
