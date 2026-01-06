import { create } from "zustand";
import type { Id } from "../../../convex/_generated/dataModel";

interface CreateFolderOptions {
	dataroomId: Id<"datarooms">;
	parentFolderId?: Id<"folders"> | null;
	mutation: (args: any) => Promise<any>;
	title?: string;
	description?: string;
}

const defaultValues = {
	dataroomId: null as Id<"datarooms"> | null,
	parentFolderId: null as Id<"folders"> | null | undefined,
	mutation: null as ((args: any) => Promise<any>) | null,
	title: undefined as string | undefined,
	description: undefined as string | undefined,
};

interface CreateFolderDialogState {
	isOpen: boolean;
	initialValues: typeof defaultValues;
	onOpen: (options: CreateFolderOptions) => void;
	onClose: () => void;
}

export const useCreateFolderDialog = create<CreateFolderDialogState>(
	(set) => ({
		isOpen: false,
		initialValues: defaultValues,
		onOpen: (options) =>
			set({
				isOpen: true,
				initialValues: {
					dataroomId: options.dataroomId,
					parentFolderId: options.parentFolderId,
					mutation: options.mutation,
					title: options.title,
					description: options.description,
				},
			}),
		onClose: () =>
			set({
				isOpen: false,
				initialValues: defaultValues,
			}),
	})
);
