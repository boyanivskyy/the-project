import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCreateDataroomDialog } from "../../../stores/dialogs/useCreateDataroomDialog";
import { useAuth } from "../../auth/AuthProvider";
import { useCallback } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { Dataroom } from "../../../types";

interface UseDataroomListOptions {
	userId: Id<"users"> | null;
}

interface UseDataroomListReturn {
	datarooms: Dataroom[] | undefined;
	isLoading: boolean;
	openCreateDialog: () => void;
}

/**
 * Hook for managing dataroom list data and actions
 * Handles fetching and creating datarooms
 */
export function useDataroomList(
	options: UseDataroomListOptions
): UseDataroomListReturn {
	const { userId } = options;
	const { user } = useAuth();

	const datarooms = useQuery(
		api.datarooms.list,
		userId ? { userId } : "skip"
	);

	const createDataroomDialog = useCreateDataroomDialog();
	const createDataroom = useMutation(api.datarooms.create);

	const openCreateDialog = useCallback(() => {
		if (!user) return;
		createDataroomDialog.open({
			mutation: (args: { name: string }) =>
				createDataroom({ ...args, userId: user._id }),
		});
	}, [user, createDataroomDialog, createDataroom]);

	return {
		datarooms,
		isLoading: datarooms === undefined,
		openCreateDialog,
	};
}
