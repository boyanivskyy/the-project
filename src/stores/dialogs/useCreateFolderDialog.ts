import { createDialogStore } from "./createDialogStore";
import type { Id } from "../../../convex/_generated/dataModel";

export interface CreateFolderPayload {
	dataroomId: Id<"datarooms">;
	parentFolderId?: Id<"folders"> | null;
	mutation: (args: {
		name: string;
		dataroomId: Id<"datarooms">;
		parentFolderId: Id<"folders"> | null;
	}) => Promise<unknown>;
	title?: string;
	description?: string;
}

export const useCreateFolderDialog = createDialogStore<CreateFolderPayload>();
