import { DataroomCard } from "./DataroomCard";
import { EmptyState } from "../../../components/shared/EmptyState";
import { LoadingList } from "../../../components/shared/LoadingList";
import { PageTitleBar } from "../../../components/shared/PageTitleBar";
import { Database } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../auth/AuthProvider";
import { useDataroomList } from "../hooks/useDataroomList";

export const DataroomList = () => {
	const { user } = useAuth();

	const { datarooms, isLoading, openCreateDialog } = useDataroomList({
		userId: user?._id ?? null,
	});

	if (isLoading) {
		return <LoadingList />;
	}

	if (!datarooms || datarooms.length === 0) {
		return (
			<div className="flex flex-col h-full overflow-hidden">
				<div className="shrink-0">
					<PageTitleBar
						title="Datarooms"
						actions={
							<Button onClick={openCreateDialog}>
								Create Dataroom
							</Button>
						}
					/>
				</div>
				<div className="flex-1 overflow-y-auto">
					<EmptyState
						icon={Database}
						title="No datarooms yet"
						description="Create your first dataroom to get started"
						action={
							<button
								onClick={openCreateDialog}
								className="text-primary hover:underline"
							>
								Create one now
							</button>
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
					title="Datarooms"
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
					{datarooms.map((dataroom) => (
						<DataroomCard key={dataroom._id} dataroom={dataroom} />
					))}
				</div>
			</div>
		</div>
	);
};
