import { create } from "zustand";
import type { Id } from "../../../convex/_generated/dataModel";

interface DeleteOptions {
	id: Id<"files"> | Id<"folders"> | Id<"datarooms">;
	name: string;
	mutation: (args: any) => Promise<any>;
	itemCount?: { total: number; folders: number; files: number };
	title?: string;
	description?: string;
}

const defaultValues = {
	id: null as Id<"files"> | Id<"folders"> | Id<"datarooms"> | null,
	name: "",
	mutation: null as ((args: any) => Promise<any>) | null,
	itemCount: undefined as
		| { total: number; folders: number; files: number }
		| undefined,
	title: undefined as string | undefined,
	description: undefined as string | undefined,
};

interface DeleteDialogState {
	isOpen: boolean;
	initialValues: typeof defaultValues;
	onOpen: (options: DeleteOptions) => void;
	onClose: () => void;
}

export const useDeleteDialog = create<DeleteDialogState>((set) => ({
	isOpen: false,
	initialValues: defaultValues,
	onOpen: (options) =>
		set({
			isOpen: true,
			initialValues: {
				id: options.id,
				name: options.name,
				mutation: options.mutation,
				itemCount: options.itemCount,
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
