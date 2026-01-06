import { Search } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Input } from "@/components/ui/input";
import { useDebounceValue } from "usehooks-ts";
import { cn } from "@/lib/utils";

interface SearchInputProps {
	className?: string;
}

export const SearchInput = ({ className }: SearchInputProps) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const urlSearch = searchParams.get("search") || "";
	const [value, setValue] = useState(urlSearch);
	const [debouncedValue, setDebouncedValue] = useDebounceValue(
		urlSearch,
		500
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

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
		setDebouncedValue(e.target.value);
	};

	return (
		<div className="w-full relative">
			<Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />

			<Input
				className={cn(
					"w-full max-w-full md:max-w-[516px] pl-9",
					className
				)}
				placeholder="Search documents"
				onChange={handleChange}
				value={value}
			/>
		</div>
	);
};
