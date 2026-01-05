// import qs from "query-string";
import { Search } from "lucide-react";

import { type ChangeEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounceValue } from "usehooks-ts";
import { cn } from "@/lib/utils";

interface SearchInputProps {
	className?: string;
}

export const SearchInput = ({ className }: SearchInputProps) => {
	// const router = useRouter();
	const [value, setValue] = useState("");
	const [debouncedValue, setDebouncedValue] = useDebounceValue("", 500);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
		setDebouncedValue(e.target.value);
	};

	// useEffect(() => {
	// 	const url = qs.stringifyUrl(
	// 		{
	// 			url: "/",
	// 			query: {
	// 				search: debouncedValue,
	// 			},
	// 		},
	// 		{ skipEmptyString: true, skipNull: true }
	// 	);

	// 	router.push(url);
	// }, [debouncedValue, router]);

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
