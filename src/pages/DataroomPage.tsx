import { useParams } from "react-router-dom";
import { FileExplorer } from "../components/explorer/FileExplorer";
import { Id } from "../../convex/_generated/dataModel";

export function DataroomPage() {
	const { dataroomId } = useParams<{ dataroomId: string }>();
	if (!dataroomId) return null;

	return <FileExplorer dataroomId={dataroomId as Id<"datarooms">} />;
}
