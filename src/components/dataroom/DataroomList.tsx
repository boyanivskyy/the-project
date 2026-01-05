import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DataroomCard } from "./DataroomCard";
import { CreateDataroomDialog } from "./CreateDataroomDialog";
import { EmptyState } from "../shared/EmptyState";
import { FolderPlus } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useSearchParams } from "react-router-dom";

export function DataroomList() {
	const [searchParams] = useSearchParams();
	const search = searchParams.get("search") || "";
	const datarooms = useQuery(api.datarooms.list);

	if (datarooms === undefined) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} className="h-32" />
				))}
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
			<EmptyState
				icon={FolderPlus}
				title={search ? "No datarooms found" : "No datarooms yet"}
				description={
					search
						? `No datarooms match "${search}"`
						: "Create your first dataroom to get started"
				}
				action={
					!search ? (
						<CreateDataroomDialog trigger={<button className="text-primary hover:underline">Create one now</button>} />
					) : null
				}
			/>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-semibold">
					{search ? `Search results (${filteredDatarooms.length})` : "Datarooms"}
				</h2>
				<CreateDataroomDialog />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{filteredDatarooms.map((dataroom) => (
					<DataroomCard key={dataroom._id} dataroom={dataroom} />
				))}
			</div>
		</div>
	);
}
