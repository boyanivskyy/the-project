import { create } from "zustand";

/**
 * Generic factory function for creating dialog stores with consistent API
 * 
 * @template TPayload - The type of payload data stored in the dialog
 * @returns A Zustand store with isOpen, payload, open, and close methods
 * 
 * @example
 * ```ts
 * interface CreateDataroomPayload {
 *   mutation: (args: { name: string }) => Promise<void>;
 *   title?: string;
 * }
 * 
 * export const useCreateDataroomDialog = createDialogStore<CreateDataroomPayload>();
 * ```
 */
export function createDialogStore<TPayload>() {
	return create<{
		isOpen: boolean;
		payload: TPayload | null;
		open: (payload: TPayload) => void;
		close: () => void;
	}>((set) => ({
		isOpen: false,
		payload: null,
		open: (payload: TPayload) =>
			set({
				isOpen: true,
				payload,
			}),
		close: () =>
			set({
				isOpen: false,
				payload: null,
			}),
	}));
}
