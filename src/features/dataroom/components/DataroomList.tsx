import { DataroomCard } from "./DataroomCard";
import { EmptyState } from "../../../components/shared/EmptyState";
import { LoadingList } from "../../../components/shared/LoadingList";
import { PageTitleBar } from "../../../components/shared/PageTitleBar";
import { FolderPlus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useSearchParams } from "react-router";
import { useAuth } from "../../auth/AuthProvider";
import { useDataroomList } from "../hooks/useDataroomList";

export const DataroomList = () => {
	const { user } = useAuth();
	const [searchParams] = useSearchParams();
	const search = searchParams.get("search") || "";

	const { datarooms, isLoading, filteredDatarooms, openCreateDialog } =
		useDataroomList({ userId: user?._id ?? null });

	if (isLoading) {
		return <LoadingList />;
	}

	const title = search
		? `Search results (${filteredDatarooms.length})`
		: "Datarooms";

	if (filteredDatarooms.length === 0) {
		return (
			<div className="flex flex-col h-full overflow-hidden">
				<div className="shrink-0">
					<PageTitleBar
						title={title}
						actions={
							<Button onClick={openCreateDialog}>
								Create Dataroom
							</Button>
						}
					/>
				</div>
				<div className="flex-1 overflow-y-auto">
					<EmptyState
						icon={FolderPlus}
						title={
							search ? "No datarooms found" : "No datarooms yet"
						}
						description={
							search
								? `No datarooms match "${search}"`
								: "Create your first dataroom to get started"
						}
						action={
							!search ? (
								<button
									onClick={openCreateDialog}
									className="text-primary hover:underline"
								>
									Create one now
								</button>
							) : null
						}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			{/* Sticky header section */}
			<div className="shrink-0">
				<PageTitleBar
					title={title}
					actions={
						<Button onClick={openCreateDialog}>
							Create Dataroom
						</Button>
					}
				/>
			</div>

			{/* Scrollable content area */}
			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col gap-4">
					{filteredDatarooms.map((dataroom) => (
						<DataroomCard key={dataroom._id} dataroom={dataroom} />
					))}
				</div>
			</div>
		</div>
	);
};
