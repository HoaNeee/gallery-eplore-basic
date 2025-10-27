import SearchPageClient from "@/components/search-page";
import { get } from "@/utils/request";

const getTotalResults = async (query: string) => {
	try {
		const res = await get(`/images?${query.replaceAll("query", "q")}`);
		if (Array.isArray(res)) {
			return res.length;
		} else if (res.total) {
			return res.total;
		}
		return null;
	} catch (error) {
		console.log(error);
		return null;
	}
};

const SearchPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
	const params = await searchParams;

	const query = (params.query || "") as string;

	const queryString = Object.keys(params)
		?.map((key) => {
			return `${key}=${params[key]}`;
		})
		.join("&");

	const totalResults = await getTotalResults(queryString);

	return (
		<section className="w-full h-full container mx-auto">
			<div className="py-12 w-full h-full md:text-start text-center md:px-0 px-4">
				{query.trim() ? (
					<h2 className="text-4xl font-bold">Ảnh về {query}</h2>
				) : (
					<h1 className="text-4xl font-bold">Tìm kiếm hình ảnh</h1>
				)}
				{query.trim() ? (
					totalResults !== null && (
						<p className="text-neutral-500 mt-2">
							{`Tìm thấy ${totalResults} kết quả cho "${query}"`}
						</p>
					)
				) : (
					<p className="text-neutral-500 mt-2">Hãy nhập từ khóa tìm kiếm</p>
				)}
				<SearchPageClient />
			</div>
		</section>
	);
};

export default SearchPage;
