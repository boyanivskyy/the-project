import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSearchParams } from "react-router";
import { useCreateDataroomDialog } from "../../../stores/dialogs/useCreateDataroomDialog";
import { useAuth } from "../../auth/AuthProvider";
import { useMemo, useCallback } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { Dataroom } from "../../../types";

interface UseDataroomListOptions {
	userId: Id<"users"> | null;
}

interface UseDataroomListReturn {
	datarooms: Dataroom[] | undefined;
	isLoading: boolean;
	filteredDatarooms: Dataroom[];
	openCreateDialog: () => void;
}

/**
 * Hook for managing dataroom list data and actions
 * Handles fetching, filtering, and creating datarooms
 */
export function useDataroomList(
	options: UseDataroomListOptions
): UseDataroomListReturn {
	const { userId } = options;
	const { user } = useAuth();
	const [searchParams] = useSearchParams();
	const search = searchParams.get("search") || "";

	const datarooms = useQuery(
		api.datarooms.list,
		userId ? { userId } : "skip"
	);

	const createDataroomDialog = useCreateDataroomDialog();
	const createDataroom = useMutation(api.datarooms.create);

	const filteredDatarooms = useMemo(() => {
		if (!datarooms) return [];
		if (!search) return datarooms;
		return datarooms.filter((d) =>
			d.name.toLowerCase().includes(search.toLowerCase())
		);
	}, [datarooms, search]);

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
		filteredDatarooms,
		openCreateDialog,
	};
}
