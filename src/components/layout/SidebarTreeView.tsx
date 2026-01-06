import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { type Folder } from "../../types";
import { SidebarTreeNode } from "./SidebarTreeNode";
import { useSidebarStore } from "../../stores/sidebarStore";
import { useEffect } from "react";

interface SidebarTreeViewProps {
	dataroomId?: Id<"datarooms">;
}

const buildFolderTree = (
	folders: Folder[],
	parentFolderId: Id<"folders"> | null
): FolderWithChildren[] => {
	return folders
		.filter((f) => f.parentFolderId === parentFolderId)
		.map((folder) => ({
			...folder,
			children: buildFolderTree(folders, folder._id),
		}));
};

interface FolderWithChildren extends Folder {
	children: FolderWithChildren[];
}

interface DataroomNodeProps {
	dataroom: { _id: Id<"datarooms">; name: string };
}

const DataroomNode = ({ dataroom }: DataroomNodeProps) => {
	const { isExpanded, toggleExpanded } = useSidebarStore();
	const isDataroomExpanded = isExpanded(dataroom._id);
	// Always fetch folders to know if dataroom has children (for chevron visibility)
	const folders = useQuery(api.folders.getAllByDataroom, {
		dataroomId: dataroom._id,
	});

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
				isLoading={folders === undefined}
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
};

interface FolderTreeProps {
	folders: FolderWithChildren[];
	dataroomId: Id<"datarooms">;
	level: number;
}

const FolderTree = ({ folders, dataroomId, level }: FolderTreeProps) => {
	const { isExpanded, toggleExpanded } = useSidebarStore();

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
};

export const SidebarTreeView = ({ dataroomId }: SidebarTreeViewProps) => {
	const datarooms = useQuery(api.datarooms.list);
	const expandedItems = useSidebarStore((state) => state.expandedItems);
	const setExpanded = useSidebarStore((state) => state.setExpanded);

	// Preload first dataroom on initial load
	useEffect(() => {
		if (
			Array.isArray(datarooms) &&
			datarooms.length &&
			!expandedItems?.length
		) {
			const firstDataroomId = datarooms[0]?._id;
			if (firstDataroomId) {
				setExpanded(firstDataroomId, true);
			}
		}
	}, [datarooms, expandedItems?.length, setExpanded]);

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
};
