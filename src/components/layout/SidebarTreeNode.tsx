import { ChevronRight, Folder, Database } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Id } from "../../../convex/_generated/dataModel";
import { type Folder as FolderType } from "../../types";
import { cn } from "../../lib/utils";

interface SidebarTreeNodeProps {
	id: string;
	name: string;
	type: "dataroom" | "folder";
	dataroomId: Id<"datarooms">;
	folderId?: Id<"folders">;
	level: number;
	isExpanded: boolean;
	hasChildren: boolean;
	onToggle: () => void;
	isLoading?: boolean;
}

export function SidebarTreeNode({
	id,
	name,
	type,
	dataroomId,
	folderId,
	level,
	isExpanded,
	hasChildren,
	onToggle,
	isLoading = false,
}: SidebarTreeNodeProps) {
	const location = useLocation();
	const isActive =
		(type === "dataroom" &&
			location.pathname === `/dataroom/${dataroomId}`) ||
		(type === "folder" &&
			folderId &&
			location.pathname === `/dataroom/${dataroomId}/folder/${folderId}`);

	const href =
		type === "dataroom"
			? `/dataroom/${dataroomId}`
			: `/dataroom/${dataroomId}/folder/${folderId}`;

	const paddingLeft = level * 16 + 8;

	return (
		<div>
			<div
				className={cn(
					"flex items-center gap-2 px-2 py-1.5 rounded-md group hover:bg-accent transition-colors",
					isActive && "bg-accent"
				)}
				style={{ paddingLeft: `${paddingLeft}px` }}
			>
				{hasChildren && (
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onToggle();
						}}
						className="p-0.5 hover:bg-accent-foreground/10 rounded transition-transform"
						style={{
							transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
						}}
					>
						<ChevronRight className="h-4 w-4 text-muted-foreground" />
					</button>
				)}
				{!hasChildren && <div className="w-5" />}
				<Link
					to={href}
					className="flex items-center gap-2 flex-1 min-w-0"
				>
					{type === "dataroom" ? (
						<Database className="h-4 w-4 text-primary shrink-0" />
					) : (
						<Folder className="h-4 w-4 text-primary shrink-0" />
					)}
					<span
						className={cn(
							"text-sm truncate",
							isActive && "font-medium"
						)}
					>
						{name}
					</span>
				</Link>
			</div>
			{isLoading && (
				<div
					className="px-2 py-1 text-xs text-muted-foreground"
					style={{ paddingLeft: `${paddingLeft + 24}px` }}
				>
					Loading...
				</div>
			)}
		</div>
	);
}
