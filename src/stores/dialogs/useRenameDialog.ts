import { create } from "zustand";
import type { Id } from "../../../convex/_generated/dataModel";

interface RenameOptions {
	id: Id<"files"> | Id<"folders"> | Id<"datarooms">;
	name: string;
	mutation: (args: any) => Promise<any>;
	title?: string;
	description?: string;
}

const defaultValues = {
	id: null as Id<"files"> | Id<"folders"> | Id<"datarooms"> | null,
	name: "",
	mutation: null as ((args: any) => Promise<any>) | null,
	title: undefined as string | undefined,
	description: undefined as string | undefined,
};

interface RenameDialogState {
	isOpen: boolean;
	initialValues: typeof defaultValues;
	onOpen: (options: RenameOptions) => void;
	onClose: () => void;
}

export const useRenameDialog = create<RenameDialogState>((set) => ({
	isOpen: false,
	initialValues: defaultValues,
	onOpen: (options) =>
		set({
			isOpen: true,
			initialValues: {
				id: options.id,
				name: options.name,
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
}));
