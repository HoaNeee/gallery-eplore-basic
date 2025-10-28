"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const FormSearch = ({
	isHeader = false,
	searchParams,
}: {
	isHeader?: boolean;
	searchParams: { [key: string]: string | string[] | undefined };
}) => {
	const router = useRouter();

	const query = searchParams?.query || "";

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const lastParams = Object.keys(searchParams)
			.filter((key) => key !== "query")
			.map(
				(key) =>
					`${encodeURIComponent(key)}=${encodeURIComponent(
						String(searchParams[key])
					)}`
			)
			.join("&");
		const input = e.currentTarget[0] as HTMLInputElement;
		const query = input.value.trim();

		let url = `/search`;

		if (lastParams && !lastParams.includes("query")) {
			url += `?${lastParams}&query=${encodeURIComponent(query)}`;
		} else {
			url += `?query=${encodeURIComponent(query)}`;
		}

		router.push(url);
	};

	return (
		<form onSubmit={handleSearch} className="w-full md:px-0 px-4">
			{!isHeader && (
				<h1 className="text-center pb-6 md:text-4xl text-3xl font-bold">
					Tìm kiếm hình ảnh miễn phí trong kho ảnh.
				</h1>
			)}
			<div className="relative">
				<input
					defaultValue={query}
					type="text"
					placeholder="Tìm kiếm hình ảnh..."
					className={`w-full px-4 bg-neutral-100 rounded-md pr-12 focus:outline-none focus:ring-2 focus:ring-neutral-200 text-lg font-semibold placeholder:text-neutral-400 ${
						isHeader ? "py-3" : "py-4"
					}`}
				/>
				<Search className="absolute top-1/2 transform -translate-y-1/2 right-4 text-neutral-400" />
			</div>
		</form>
	);
};

export default FormSearch;
