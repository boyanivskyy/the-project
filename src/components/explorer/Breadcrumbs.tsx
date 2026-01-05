import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface BreadcrumbsProps {
	dataroomId: Id<"datarooms">;
	folderId?: Id<"folders"> | null;
}

export function Breadcrumbs({ dataroomId, folderId }: BreadcrumbsProps) {
	const dataroom = useQuery(api.datarooms.get, { id: dataroomId });
	const folder = useQuery(
		api.folders.get,
		folderId ? { id: folderId } : "skip"
	);

	if (!dataroom) {
		return <div className="h-6" />;
	}

	const crumbs = [
		{ name: dataroom.name, path: `/dataroom/${dataroomId}` },
	];

	if (folderId && folder) {
		crumbs.push({
			name: folder.name,
			path: `/dataroom/${dataroomId}/folder/${folderId}`,
		});
	}

	return (
		<nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
			<Link
				to="/"
				className="hover:text-foreground transition-colors flex items-center gap-1"
			>
				<Home className="h-4 w-4" />
			</Link>
			{crumbs.map((crumb, index) => (
				<div key={crumb.path} className="flex items-center gap-2">
					<ChevronRight className="h-4 w-4" />
					{index === crumbs.length - 1 ? (
						<span className="text-foreground font-medium">
							{crumb.name}
						</span>
					) : (
						<Link
							to={crumb.path}
							className="hover:text-foreground transition-colors"
						>
							{crumb.name}
						</Link>
					)}
				</div>
			))}
		</nav>
	);
}
