import { useParams } from "react-router";
import { FileExplorer } from "../components/explorer/FileExplorer";
import type { Id } from "../../convex/_generated/dataModel";

export function DataroomPage() {
	const { dataroomId } = useParams<{ dataroomId: string }>();

	// dataroomId is validated by the route loader, so it's safe to use
	return <FileExplorer dataroomId={dataroomId as Id<"datarooms">} />;
}
