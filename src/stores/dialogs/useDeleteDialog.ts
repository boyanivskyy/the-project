import { createDialogStore } from "./createDialogStore";
import type { Id } from "../../../convex/_generated/dataModel";

export interface DeletePayload {
	id: Id<"files"> | Id<"folders"> | Id<"datarooms">;
	name: string;
	mutation: (args: { id: Id<"files"> | Id<"folders"> | Id<"datarooms"> }) => Promise<unknown>;
	itemCount?: { total: number; folders: number; files: number };
	title?: string;
	description?: string;
}

export const useDeleteDialog = createDialogStore<DeletePayload>();
