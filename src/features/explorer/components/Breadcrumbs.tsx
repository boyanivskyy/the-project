import { Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "../../auth/AuthProvider";

interface BreadcrumbsProps {
	dataroomId: Id<"datarooms">;
	folderId?: Id<"folders"> | null;
}

export const Breadcrumbs = ({ dataroomId, folderId }: BreadcrumbsProps) => {
	const { user } = useAuth();
	const dataroom = useQuery(
		api.datarooms.get,
		user ? { id: dataroomId, userId: user._id } : "skip"
	);
	const folderPath = useQuery(
		api.folders.getBreadcrumbPath,
		folderId && user
			? { folderId, dataroomId, userId: user._id }
			: "skip"
	);

	if (!dataroom) {
		return <div className="h-6" />;
	}

	const crumbs = [{ name: dataroom.name, path: `/dataroom/${dataroomId}` }];

	// Add all parent folders from the path
	if (folderPath) {
		folderPath.forEach((folder) => {
			crumbs.push({
				name: folder.name,
				path: `/dataroom/${dataroomId}/folder/${folder._id}`,
			});
		});
	}

	return (
		<nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
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
};
