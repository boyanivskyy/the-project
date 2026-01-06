import { Link } from "react-router";
import { SearchInput } from "./SearchInput";
import { ThemeToggle } from "./shared/ThemeToggle";

export const Header = () => {
	return (
		<div className="bg-background/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
			<div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4">
				{/* Mobile layout: title and button on top row, search below */}
				<div className="md:hidden flex flex-col gap-4">
					<div className="flex justify-between items-center">
						<Link
							to="/"
							className="text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity"
						>
							the project
						</Link>
						<ThemeToggle />
					</div>
					<div className="w-full">
						<SearchInput />
					</div>
				</div>
				{/* Desktop layout: 3-column grid */}
				<div className="hidden md:grid md:grid-cols-3 items-center gap-4">
					<Link
						to="/"
						className="text-2xl font-bold hover:opacity-80 transition-opacity"
					>
						the project
					</Link>
					<div className="flex justify-center">
						<SearchInput className="md:max-w-[516px]" />
					</div>
					<div className="flex justify-end">
						<ThemeToggle />
					</div>
				</div>
			</div>
		</div>
	);
};
