import { Search, Database, Folder, File } from "lucide-react";
import {
	type ChangeEvent,
	useEffect,
	useState,
	useRef,
	useCallback,
} from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { useDebounceValue } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthProvider";
import type { SearchResult } from "../../convex/search";

interface SearchInputProps {
	className?: string;
}

export const SearchInput = ({ className }: SearchInputProps) => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const urlSearch = searchParams.get("search") || "";
	const [value, setValue] = useState(urlSearch);
	const [debouncedValue, setDebouncedValue] = useDebounceValue(
		urlSearch,
		500
	);
	const [isOpen, setIsOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const containerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const hasUserInteracted = useRef(false);
	const hadSearchOnMount = useRef(urlSearch.trim().length > 0);

	// Fetch all searchable items
	const allItems = useQuery(
		api.search.searchAll,
		user ? { userId: user._id } : "skip"
	);

	// Sync URL param to local state on mount/param change
	useEffect(() => {
		setValue(urlSearch);
		setDebouncedValue(urlSearch);
	}, [urlSearch, setDebouncedValue]);

	// Update URL when debounced value changes
	useEffect(() => {
		const params = new URLSearchParams(searchParams);
		if (debouncedValue.trim()) {
			params.set("search", debouncedValue);
		} else {
			params.delete("search");
		}
		setSearchParams(params, { replace: true });
	}, [debouncedValue, searchParams, setSearchParams]);

	// Show dropdown when typing (but not on initial mount with search param)
	useEffect(() => {
		// Only open dropdown if user has interacted or if there was no search param on mount
		if (!hadSearchOnMount.current || hasUserInteracted.current) {
			setIsOpen(debouncedValue.trim().length > 0);
			setFocusedIndex(-1);
		}
	}, [debouncedValue]);

	// Filter results based on search query
	const filteredResults = allItems
		? allItems.filter((item) => {
				const searchLower = debouncedValue.toLowerCase();
				return (
					item.name.toLowerCase().includes(searchLower) ||
					item.path.toLowerCase().includes(searchLower)
				);
			})
		: [];

	// Group results by type
	const datarooms = filteredResults.filter(
		(item) => item.type === "dataroom"
	);
	const folders = filteredResults.filter((item) => item.type === "folder");
	const files = filteredResults.filter((item) => item.type === "file");

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		hasUserInteracted.current = true;
		setValue(e.target.value);
		setDebouncedValue(e.target.value);
	};

	const handleItemClick = useCallback(
		(item: SearchResult) => {
			if (item.type === "dataroom") {
				navigate(`/dataroom/${item.dataroomId}`);
			} else if (item.type === "folder") {
				navigate(
					`/dataroom/${item.dataroomId}/folder/${item.folderId}`
				);
			} else if (item.type === "file") {
				// Navigate to the folder containing the file
				if (item.folderId) {
					navigate(
						`/dataroom/${item.dataroomId}/folder/${item.folderId}`
					);
				} else {
					navigate(`/dataroom/${item.dataroomId}`);
				}
			}
			setIsOpen(false);
			setValue("");
			setDebouncedValue("");
		},
		[navigate]
	);

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen || filteredResults.length === 0) return;

		const totalItems = filteredResults.length;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setFocusedIndex((prev) =>
				prev < totalItems - 1 ? prev + 1 : prev
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
		} else if (e.key === "Enter" && focusedIndex >= 0) {
			e.preventDefault();
			const selectedItem = filteredResults[focusedIndex];
			if (selectedItem) {
				handleItemClick(selectedItem);
			}
		} else if (e.key === "Escape") {
			setIsOpen(false);
			setFocusedIndex(-1);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setFocusedIndex(-1);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [isOpen]);

	// Scroll focused item into view
	useEffect(() => {
		if (focusedIndex >= 0 && dropdownRef.current) {
			const focusedElement = dropdownRef.current.querySelector(
				`[data-index="${focusedIndex}"]`
			);
			if (focusedElement) {
				focusedElement.scrollIntoView({
					block: "nearest",
					behavior: "smooth",
				});
			}
		}
	}, [focusedIndex]);

	const renderItem = (item: SearchResult, index: number) => {
		const isFocused = index === focusedIndex;
		let icon;
		if (item.type === "dataroom") {
			icon = <Database className="h-4 w-4 text-primary shrink-0" />;
		} else if (item.type === "folder") {
			icon = <Folder className="h-4 w-4 text-primary shrink-0" />;
		} else {
			icon = <File className="h-4 w-4 text-destructive shrink-0" />;
		}

		return (
			<button
				key={`${item.type}-${item.id}`}
				data-index={index}
				type="button"
				onClick={() => handleItemClick(item)}
				className={cn(
					"w-full text-left px-3 py-2 hover:bg-accent transition-colors rounded-sm flex items-start gap-2",
					isFocused && "bg-accent"
				)}
			>
				{icon}
				<div className="flex-1 min-w-0">
					<div className="font-medium text-sm truncate">
						{item.name}
					</div>
					{item.path !== item.name && (
						<div className="text-xs text-muted-foreground truncate">
							{item.path}
						</div>
					)}
				</div>
			</button>
		);
	};

	let itemIndex = 0;

	return (
		<div className="w-full relative" ref={containerRef}>
			<Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />

			<Input
				ref={inputRef}
				className={cn(
					"w-full max-w-full md:max-w-[516px] pl-9",
					className
				)}
				placeholder="Search documents"
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onFocus={() => {
					hasUserInteracted.current = true;
					if (debouncedValue.trim().length > 0) {
						setIsOpen(true);
					}
				}}
				value={value}
				autoFocus={false}
			/>

			{isOpen && debouncedValue.trim().length > 0 && (
				<div
					ref={dropdownRef}
					className="absolute top-full mt-1 w-full max-w-full md:max-w-[516px] bg-popover border rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto"
				>
					{allItems === undefined ? (
						<div className="px-3 py-4 text-sm text-muted-foreground text-center">
							Loading...
						</div>
					) : filteredResults.length === 0 ? (
						<div className="px-3 py-4 text-sm text-muted-foreground text-center">
							No results found
						</div>
					) : (
						<div className="py-1">
							{datarooms.length > 0 && (
								<div>
									<div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
										Datarooms
									</div>
									{datarooms.map((item) => {
										const index = itemIndex++;
										return renderItem(item, index);
									})}
								</div>
							)}
							{folders.length > 0 && (
								<div>
									{datarooms.length > 0 && (
										<div className="border-t my-1" />
									)}
									<div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
										Folders
									</div>
									{folders.map((item) => {
										const index = itemIndex++;
										return renderItem(item, index);
									})}
								</div>
							)}
							{files.length > 0 && (
								<div>
									{(datarooms.length > 0 ||
										folders.length > 0) && (
										<div className="border-t my-1" />
									)}
									<div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
										Files
									</div>
									{files.map((item) => {
										const index = itemIndex++;
										return renderItem(item, index);
									})}
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};
