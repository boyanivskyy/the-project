import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { type Folder } from "../../types";
import { SidebarTreeNode } from "./SidebarTreeNode";
import { useSidebarState } from "../../hooks/useSidebarState";
import { useEffect } from "react";

interface SidebarTreeViewProps {
	dataroomId?: Id<"datarooms">;
}

function buildFolderTree(
	folders: Folder[],
	parentFolderId: Id<"folders"> | null
): Folder[] {
	return folders
		.filter((f) => f.parentFolderId === parentFolderId)
		.map((folder) => ({
			...folder,
			children: buildFolderTree(folders, folder._id),
		}));
}

interface FolderWithChildren extends Folder {
	children: FolderWithChildren[];
}

interface DataroomNodeProps {
	dataroom: { _id: Id<"datarooms">; name: string };
}

function DataroomNode({ dataroom }: DataroomNodeProps) {
	const { isExpanded, toggleExpanded } = useSidebarState();
	const isDataroomExpanded = isExpanded(dataroom._id);
	const folders = useQuery(
		api.folders.getAllByDataroom,
		isDataroomExpanded
			? { dataroomId: dataroom._id }
			: "skip"
	);

	const folderList = folders || [];
	const folderTree = buildFolderTree(folderList, null);
	const hasFolders = folderTree.length > 0;

	return (
		<div>
			<SidebarTreeNode
				id={dataroom._id}
				name={dataroom.name}
				type="dataroom"
				dataroomId={dataroom._id}
				level={0}
				isExpanded={isDataroomExpanded}
				hasChildren={hasFolders}
				onToggle={() => toggleExpanded(dataroom._id)}
				isLoading={isDataroomExpanded && folders === undefined}
			/>
			{isDataroomExpanded && (
				<FolderTree
					folders={folderTree}
					dataroomId={dataroom._id}
					level={1}
				/>
			)}
		</div>
	);
}

interface FolderTreeProps {
	folders: FolderWithChildren[];
	dataroomId: Id<"datarooms">;
	level: number;
}

function FolderTree({ folders, dataroomId, level }: FolderTreeProps) {
	const { isExpanded, toggleExpanded } = useSidebarState();

	return (
		<>
			{folders.map((folder) => {
				const folderId = folder._id;
				const isFolderExpanded = isExpanded(folderId);
				const children = folder.children || [];
				const hasChildren = children.length > 0;

				return (
					<div key={folderId}>
						<SidebarTreeNode
							id={folderId}
							name={folder.name}
							type="folder"
							dataroomId={dataroomId}
							folderId={folderId}
							level={level}
							isExpanded={isFolderExpanded}
							hasChildren={hasChildren}
							onToggle={() => toggleExpanded(folderId)}
						/>
						{isFolderExpanded && hasChildren && (
							<FolderTree
								folders={children}
								dataroomId={dataroomId}
								level={level + 1}
							/>
						)}
					</div>
				);
			})}
		</>
	);
}

export function SidebarTreeView({ dataroomId }: SidebarTreeViewProps) {
	const datarooms = useQuery(api.datarooms.list);
	const { expandedItems, setExpanded } = useSidebarState();

	// Preload first dataroom on initial load
	useEffect(() => {
		if (datarooms && datarooms.length > 0 && expandedItems.size === 0) {
			const firstDataroomId = datarooms[0]._id;
			setExpanded(firstDataroomId, true);
		}
	}, [datarooms, expandedItems.size, setExpanded]);

	if (datarooms === undefined) {
		return (
			<div className="p-4 text-sm text-muted-foreground">Loading...</div>
		);
	}

	if (datarooms.length === 0) {
		return (
			<div className="p-4 text-sm text-muted-foreground">
				No datarooms yet
			</div>
		);
	}

	return (
		<div className="py-2">
			{datarooms.map((dataroom) => (
				<DataroomNode key={dataroom._id} dataroom={dataroom} />
			))}
		</div>
	);
}
