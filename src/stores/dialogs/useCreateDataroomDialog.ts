import { create } from "zustand";

interface CreateDataroomOptions {
	mutation: (args: any) => Promise<any>;
	title?: string;
	description?: string;
}

const defaultValues = {
	mutation: null as ((args: any) => Promise<any>) | null,
	title: undefined as string | undefined,
	description: undefined as string | undefined,
};

interface CreateDataroomDialogState {
	isOpen: boolean;
	initialValues: typeof defaultValues;
	onOpen: (options: CreateDataroomOptions) => void;
	onClose: () => void;
}

export const useCreateDataroomDialog = create<CreateDataroomDialogState>(
	(set) => ({
		isOpen: false,
		initialValues: defaultValues,
		onOpen: (options) =>
			set({
				isOpen: true,
				initialValues: {
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
