import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { type Folder, type UserRole } from "../../types";
import { SidebarTreeNode } from "./SidebarTreeNode";
import { useSidebarStore } from "../../stores/sidebarStore";
import { useEffect, useMemo } from "react";
import { useAuth } from "../../features/auth/AuthProvider";

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
	dataroom: { _id: Id<"datarooms">; name: string; role?: UserRole };
	userId: Id<"users">;
}

const expandAllFoldersRecursively = (
	folderTree: FolderWithChildren[],
	expandedItems: string[],
	setExpanded: (id: string, expanded: boolean) => void
) => {
	folderTree.forEach((folder) => {
		if (!expandedItems.includes(folder._id)) {
			setExpanded(folder._id, true);
		}
		if (folder.children && folder.children.length > 0) {
			expandAllFoldersRecursively(
				folder.children,
				expandedItems,
				setExpanded
			);
		}
	});
};

const DataroomNode = ({ dataroom, userId }: DataroomNodeProps) => {
	const { isExpanded, toggleExpanded, setExpanded, expandedItems } =
		useSidebarStore();
	const isDataroomExpanded = isExpanded(dataroom._id);
	// Always fetch folders to know if dataroom has children (for chevron visibility)
	const folders = useQuery(api.folders.getAllByDataroom, {
		dataroomId: dataroom._id,
		userId,
	});

	const folderList = folders || [];
	const folderTree = useMemo(
		() => buildFolderTree(folderList, null),
		[folderList]
	);
	const hasFolders = folderTree.length > 0;

	// Expand all folders by default on initial load (if dataroom is expanded and folders are loaded)
	useEffect(() => {
		if (
			isDataroomExpanded &&
			folders &&
			folders.length > 0 &&
			folderTree.length > 0
		) {
			expandAllFoldersRecursively(folderTree, expandedItems, setExpanded);
		}
	}, [isDataroomExpanded, folders, folderTree, expandedItems, setExpanded]);

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
				role={dataroom.role}
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
	const { user } = useAuth();
	const datarooms = useQuery(
		api.datarooms.list,
		user ? { userId: user._id } : "skip"
	);
	const expandedItems = useSidebarStore((state) => state.expandedItems);
	const setExpanded = useSidebarStore((state) => state.setExpanded);

	// Expand all datarooms by default on initial load
	useEffect(() => {
		if (
			Array.isArray(datarooms) &&
			datarooms.length &&
			!expandedItems?.length
		) {
			// Expand all datarooms on initial load
			datarooms.forEach((dataroom) => {
				setExpanded(dataroom._id, true);
			});
		}
	}, [datarooms, expandedItems?.length, setExpanded]);

	if (datarooms === undefined || !user) {
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
				<DataroomNode
					key={dataroom._id}
					dataroom={dataroom}
					userId={user._id}
				/>
			))}
		</div>
	);
};
