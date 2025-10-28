import FormSearch from "@/components/form-search";
import { ListImageContainer } from "@/components/list-image";
import { Suspense } from "react";

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const searchParamsQuery = await searchParams;

	return (
		<section className="pt-4 pb-8 md:py-12 h-full w-full">
			<div className="container w-full h-full mx-auto">
				<FormSearch searchParams={searchParamsQuery} />
				<Suspense fallback={<></>}>
					<ListImageContainer />
				</Suspense>
			</div>
		</section>
	);
}
