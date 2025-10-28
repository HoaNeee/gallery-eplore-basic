"use client";

import { useEffect } from "react";
import { ListImageContainer } from "./list-image";

const SearchPageClient = ({ query }: { query: string }) => {
	useEffect(() => {
		if (typeof window !== "undefined") {
			document.title = `${query || "Search"} - Search Results`;
		}
	}, [query]);

	return (
		<div className="w-full">
			<ListImageContainer />
		</div>
	);
};

export default SearchPageClient;
