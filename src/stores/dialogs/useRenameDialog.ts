import { createDialogStore } from "./createDialogStore";
import type { Id } from "../../../convex/_generated/dataModel";

export interface RenamePayload {
	id: Id<"files"> | Id<"folders"> | Id<"datarooms">;
	name: string;
	mutation: (args: {
		id: Id<"files"> | Id<"folders"> | Id<"datarooms">;
		name: string;
	}) => Promise<unknown>;
	title?: string;
	description?: string;
}

export const useRenameDialog = createDialogStore<RenamePayload>();
