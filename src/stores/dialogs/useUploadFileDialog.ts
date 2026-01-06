import { create } from "zustand";
import type { Id } from "../../../convex/_generated/dataModel";

interface UploadOptions {
	dataroomId: Id<"datarooms">;
	folderId?: Id<"folders"> | null;
	generateUploadUrl: () => Promise<string>;
	createFile: (args: any) => Promise<any>;
	title?: string;
	description?: string;
}

const defaultValues = {
	dataroomId: null as Id<"datarooms"> | null,
	folderId: null as Id<"folders"> | null | undefined,
	generateUploadUrl: null as (() => Promise<string>) | null,
	createFile: null as ((args: any) => Promise<any>) | null,
	title: undefined as string | undefined,
	description: undefined as string | undefined,
};

interface UploadFileDialogState {
	isOpen: boolean;
	initialValues: typeof defaultValues;
	onOpen: (options: UploadOptions) => void;
	onClose: () => void;
}

export const useUploadFileDialog = create<UploadFileDialogState>((set) => ({
	isOpen: false,
	initialValues: defaultValues,
	onOpen: (options) =>
		set({
			isOpen: true,
			initialValues: {
				dataroomId: options.dataroomId,
				folderId: options.folderId,
				generateUploadUrl: options.generateUploadUrl,
				createFile: options.createFile,
				title: options.title,
				description: options.description,
			},
		}),
	onClose: () =>
		set({
			isOpen: false,
			initialValues: defaultValues,
		}),
}));
