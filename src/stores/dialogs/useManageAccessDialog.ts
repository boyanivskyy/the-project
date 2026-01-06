import { create } from "zustand";
import type { Id } from "../../../convex/_generated/dataModel";

interface ManageAccessDialogState {
	isOpen: boolean;
	dataroomId: Id<"datarooms"> | null;
	dataroomName: string | null;
	onOpen: (dataroomId: Id<"datarooms">, dataroomName: string) => void;
	onClose: () => void;
}

export const useManageAccessDialog = create<ManageAccessDialogState>(
	(set) => ({
		isOpen: false,
		dataroomId: null,
		dataroomName: null,
		onOpen: (dataroomId, dataroomName) =>
			set({ isOpen: true, dataroomId, dataroomName }),
		onClose: () => set({ isOpen: false, dataroomId: null, dataroomName: null }),
	})
);
