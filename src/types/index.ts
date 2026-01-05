import { Id } from "../../convex/_generated/dataModel";

export type Dataroom = {
	_id: Id<"datarooms">;
	_creationTime: number;
	name: string;
	createdAt: number;
	updatedAt: number;
};

export type Folder = {
	_id: Id<"folders">;
	_creationTime: number;
	name: string;
	dataroomId: Id<"datarooms">;
	parentFolderId: Id<"folders"> | null;
	createdAt: number;
	updatedAt: number;
};

export type File = {
	_id: Id<"files">;
	_creationTime: number;
	name: string;
	dataroomId: Id<"datarooms">;
	folderId: Id<"folders"> | null;
	storageId: Id<"_storage">;
	mimeType: string;
	size: number;
	createdAt: number;
	updatedAt: number;
};
