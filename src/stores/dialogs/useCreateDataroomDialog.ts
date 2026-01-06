import { createDialogStore } from "./createDialogStore";

export interface CreateDataroomPayload {
	mutation: (args: { name: string }) => Promise<unknown>;
	title?: string;
	description?: string;
}

export const useCreateDataroomDialog = createDialogStore<CreateDataroomPayload>();
