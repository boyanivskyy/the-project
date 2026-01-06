import { createDialogStore } from "./createDialogStore";
import type { Id } from "../../../convex/_generated/dataModel";

export interface UploadFilePayload {
	dataroomId: Id<"datarooms">;
	folderId?: Id<"folders"> | null;
	generateUploadUrl: () => Promise<string>;
	createFile: (args: {
		name: string;
		dataroomId: Id<"datarooms">;
		folderId: Id<"folders"> | null;
		storageId: Id<"_storage">;
		mimeType: string;
		size: number;
	}) => Promise<unknown>;
	title?: string;
	description?: string;
}

export const useUploadFileDialog = createDialogStore<UploadFilePayload>();
