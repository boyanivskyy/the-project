import { SearchInput } from "./SearchInput";
import { Button } from "./ui/button";

export const Header = () => {
	return (
		<div className="bg-background/50 backdrop-blur-sm w-screen">
			<div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4">
				{/* Mobile layout: title and button on top row, search below */}
				<div className="md:hidden flex flex-col gap-4">
					<div className="flex justify-between items-center">
						<h1 className="text-xl sm:text-2xl font-bold">
							the project
						</h1>
						<Button>hello</Button>
					</div>
					<div className="w-full">
						<SearchInput />
					</div>
				</div>
				{/* Desktop layout: 3-column grid */}
				<div className="hidden md:grid md:grid-cols-3 items-center gap-4">
					<h1 className="text-2xl font-bold">the project</h1>
					<div className="flex justify-center">
						<SearchInput className="md:max-w-[516px]" />
					</div>
					<div className="flex justify-end">
						<Button>hello</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
