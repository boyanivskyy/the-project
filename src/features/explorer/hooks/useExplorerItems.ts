import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSafeQuery } from "../../../hooks/useSafeQuery";
import { useCreateFolderDialog } from "../../../stores/dialogs/useCreateFolderDialog";
import { useUploadFileDialog } from "../../../stores/dialogs/useUploadFileDialog";
import { useAuth } from "../../auth/AuthProvider";
import { useCallback } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { Folder, File } from "../../../types";

interface UseExplorerItemsOptions {
	userId: Id<"users"> | null;
	dataroomId: Id<"datarooms">;
	folderId?: Id<"folders"> | null;
}

interface ExplorerActions {
	openCreateFolderDialog: () => void;
	openUploadFileDialog: () => void;
}

interface UseExplorerItemsReturn {
	folders: Folder[];
	files: File[];
	isLoading: boolean;
	error: Error | null;
	hasItems: boolean;
	actions: ExplorerActions;
}

/**
 * Hook for managing file explorer data and actions
 * Handles fetching folders/files and action dialogs
 */
export function useExplorerItems(
	options: UseExplorerItemsOptions
): UseExplorerItemsReturn {
	const { userId, dataroomId, folderId } = options;
	const { user } = useAuth();

	const createFolderDialog = useCreateFolderDialog();
	const uploadFileDialog = useUploadFileDialog();
	const createFolder = useMutation(api.folders.create);
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const createFile = useMutation(api.files.create);

	const {
		data: folders,
		isLoading: foldersLoading,
		error: foldersError,
	} = useSafeQuery(api.folders.list, {
		userId: userId!,
		dataroomId,
		parentFolderId: folderId || null,
	});

	const {
		data: files,
		isLoading: filesLoading,
		error: filesError,
	} = useSafeQuery(api.files.list, {
		userId: userId!,
		dataroomId,
		folderId: folderId || null,
	});

	const safeFolders = folders || [];
	const safeFiles = files || [];
	const hasItems = safeFolders.length > 0 || safeFiles.length > 0;

	const openCreateFolderDialog = useCallback(() => {
		if (!user) return;
		createFolderDialog.open({
			dataroomId,
			parentFolderId: folderId || null,
			mutation: (args: {
				name: string;
				dataroomId: Id<"datarooms">;
				parentFolderId: Id<"folders"> | null;
			}) => createFolder({ ...args, userId: user._id }),
		});
	}, [user, dataroomId, folderId, createFolderDialog, createFolder]);

	const openUploadFileDialog = useCallback(() => {
		if (!user) return;
		uploadFileDialog.open({
			dataroomId,
			folderId: folderId || null,
			generateUploadUrl: () => generateUploadUrl({ userId: user._id }),
			createFile: (args: {
				name: string;
				dataroomId: Id<"datarooms">;
				folderId: Id<"folders"> | null;
				storageId: Id<"_storage">;
				mimeType: string;
				size: number;
			}) => createFile({ ...args, userId: user._id }),
		});
	}, [
		user,
		dataroomId,
		folderId,
		uploadFileDialog,
		generateUploadUrl,
		createFile,
	]);

	return {
		folders: safeFolders,
		files: safeFiles,
		isLoading: foldersLoading || filesLoading,
		error: foldersError || filesError,
		hasItems,
		actions: {
			openCreateFolderDialog,
			openUploadFileDialog,
		},
	};
}
