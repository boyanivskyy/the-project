import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DataroomCard } from "./DataroomCard";
import { EmptyState } from "../shared/EmptyState";
import { FolderPlus } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useSearchParams } from "react-router";
import { useCreateDataroomDialog } from "../../stores/dialogs/useCreateDataroomDialog";

export const DataroomList = () => {
	const [searchParams] = useSearchParams();
	const search = searchParams.get("search") || "";
	const datarooms = useQuery(api.datarooms.list);
	const createDataroomDialog = useCreateDataroomDialog();
	const createDataroom = useMutation(api.datarooms.create);

	if (datarooms === undefined) {
		return (
			<div className="flex flex-col h-full overflow-hidden">
				<div className="shrink-0 mb-6">
					<Skeleton className="h-8 w-48" />
				</div>
				<div className="flex-1 overflow-y-auto">
					<div className="flex flex-col gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-24 w-full" />
						))}
					</div>
				</div>
			</div>
		);
	}

	const filteredDatarooms = search
		? datarooms.filter((d) =>
				d.name.toLowerCase().includes(search.toLowerCase())
			)
		: datarooms;

	if (filteredDatarooms.length === 0) {
		return (
			<div className="flex flex-col h-full overflow-hidden">
				<div className="shrink-0">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-semibold">
							{search
								? `Search results (${filteredDatarooms.length})`
								: "Datarooms"}
						</h2>
						<Button
							onClick={() =>
								createDataroomDialog.onOpen({
									mutation: (args) => createDataroom(args),
								})
							}
						>
							Create Dataroom
						</Button>
					</div>
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
									onClick={() =>
										createDataroomDialog.onOpen({
											mutation: (args) =>
												createDataroom(args),
										})
									}
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
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-semibold">
						{search
							? `Search results (${filteredDatarooms.length})`
							: "Datarooms"}
					</h2>
					<Button
						onClick={() =>
							createDataroomDialog.onOpen({
								mutation: (args) => createDataroom(args),
							})
						}
					>
						Create Dataroom
					</Button>
				</div>
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
