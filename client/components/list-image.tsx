/* eslint-disable @next/next/no-img-element */
"use client";

import { fetcher } from "@/utils/request";
import {
	Dispatch,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Button } from "./ui/button";
import { ArrowLeft, Bug, Search, Settings2, X } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { TImage } from "@/types/image.types";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";
import { TCategory } from "@/types/category.types";
import { Slider } from "./ui/slider";
import {
	ReadonlyURLSearchParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import { ButtonGroup } from "./ui/button-group";
import { sleep } from "@/utils/utils";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import Viewer from "viewerjs";

const maxHeight = 800;

const initialFilterValues = {
	direction: "",
	categoryId: "",
};

const FilterPanel = ({
	openFilter,
}: {
	openFilter: boolean;
	setOpenFilter: Dispatch<boolean>;
}) => {
	const [heightRange, setHeightRange] = useState<[number, number]>([0, 1000]);
	const [widthRange, setWidthRange] = useState<[number, number]>([0, 1000]);

	const [valueRange, setValueRange] = useState<{
		height: [number, number];
		width: [number, number];
	}>({ height: [0, 0], width: [0, 0] });

	const router = useRouter();
	const pathName = usePathname();

	const [filterValues, setFilterValues] = useState(initialFilterValues);

	const searchParams = useSearchParams();

	const { data: maxHeight } = useSWR(
		"/images?_sort=height&_order=desc&_limit=1",
		fetcher
	);
	const { data: minHeight } = useSWR(
		"/images?_sort=height&_order=asc&_limit=1",
		fetcher
	);
	const { data: maxWidth } = useSWR(
		"/images?_sort=width&_order=desc&_limit=1",
		fetcher
	);
	const { data: minWidth } = useSWR(
		"/images?_sort=width&_order=asc&_limit=1",
		fetcher
	);

	const { data: categories } = useSWR("/categories", fetcher);

	const updateFilterValues = useCallback(
		(
			key: keyof typeof initialFilterValues,
			value: (typeof initialFilterValues)[typeof key]
		) => {
			setFilterValues((prev) => ({ ...prev, [key]: value }));
		},
		[]
	);

	const updateInitialValuesFilter = useCallback(
		(
			minWidth: number,
			maxWidth: number,
			minHeight: number,
			maxHeight: number
		) => {
			const widthGTEParam = Math.max(
				Number(searchParams.get("width_gte") || "0"),
				minWidth
			);
			const widthLTEParam = Math.min(
				Number(searchParams.get("width_lte") || Infinity),
				maxWidth
			);
			const heightGTEParam = Math.max(
				Number(searchParams.get("height_gte") || "0"),
				minHeight
			);
			const heightLTEParam = Math.min(
				Number(searchParams.get("height_lte") || Infinity),
				maxHeight
			);

			const directionParam = searchParams.get("direction") || "";
			const categoryParam = searchParams.get("category") || "";

			if (widthGTEParam || widthLTEParam) {
				setValueRange((prev) => ({
					...prev,
					width: [widthGTEParam, widthLTEParam] as [number, number],
				}));
			}
			if (heightGTEParam || heightLTEParam) {
				setValueRange((prev) => ({
					...prev,
					height: [heightGTEParam, heightLTEParam] as [number, number],
				}));
			}
			updateFilterValues("direction", directionParam);
			updateFilterValues("categoryId", categoryParam);
		},
		[searchParams, updateFilterValues]
	);

	useEffect(() => {
		if (maxHeight && minHeight && maxWidth && minWidth) {
			const minHeightData =
				minHeight.data?.[0]?.height || minHeight[0]?.height || 0;
			const maxHeightData =
				maxHeight.data?.[0]?.height || maxHeight[0]?.height || 1000;
			const minWidthData = minWidth.data?.[0]?.width || minWidth[0]?.width || 0;
			const maxWidthData =
				maxWidth.data?.[0]?.width || maxWidth[0]?.width || 1000;

			// eslint-disable-next-line react-hooks/set-state-in-effect
			setHeightRange([minHeightData, maxHeightData]);
			setWidthRange([minWidthData, maxWidthData]);
			updateInitialValuesFilter(
				minWidthData,
				maxWidthData,
				minHeightData,
				maxHeightData
			);
		}
	}, [maxHeight, minHeight, maxWidth, minWidth, updateInitialValuesFilter]);

	const handleFilter = useCallback(() => {
		const current_query = new URLSearchParams(searchParams.toString());

		if (filterValues.direction) {
			current_query.set("direction", filterValues.direction);
		} else {
			current_query.delete("direction");
		}
		if (filterValues.categoryId) {
			current_query.set("category", filterValues.categoryId);
		} else {
			current_query.delete("category");
		}
		if (valueRange.width[0] && valueRange.width[0] > widthRange[0]) {
			current_query.set("width_gte", valueRange.width[0].toString());
		} else {
			current_query.delete("width_gte");
		}
		if (valueRange.width[1] && valueRange.width[1] < widthRange[1]) {
			current_query.set("width_lte", valueRange.width[1].toString());
		} else {
			current_query.delete("width_lte");
		}
		if (valueRange.height[0] && valueRange.height[0] > heightRange[0]) {
			current_query.set("height_gte", valueRange.height[0].toString());
		} else {
			current_query.delete("height_gte");
		}

		if (valueRange.height[1] && valueRange.height[1] < heightRange[1]) {
			current_query.set("height_lte", valueRange.height[1].toString());
		}

		const url = `${pathName}?${current_query.toString()}`;

		router.push(url, { scroll: false });
		// mutate(url);
	}, [
		filterValues,
		valueRange,
		searchParams,
		pathName,
		router,
		widthRange,
		heightRange,
	]);

	const directions = [
		{ label: "Ngang", value: "landscape" },
		{ label: "Dọc", value: "portrait" },
		{ label: "Vuông", value: "square" },
	];

	return (
		<div
			style={{
				maxWidth: openFilter ? "280px" : "0px",
				opacity: openFilter ? 1 : 0,
				pointerEvents: openFilter ? "auto" : "none",
				whiteSpace: "nowrap",
			}}
			className={`transition-all duration-300 ease-in-out overflow md:sticky md:top-18 md:mt-0 mt-8 self-start ${
				openFilter ? "md:w-70 w-full" : "w-full md:w-0"
			}`}
		>
			<div className="relative">
				<Accordion
					type="multiple"
					className="md:absolute md:w-70 w-full"
					defaultValue={["direction", "categoryId", "width", "height"]}
				>
					<AccordionItem value="direction">
						<AccordionTrigger className="text-lg font-semibold">
							Hướng
						</AccordionTrigger>
						<AccordionContent className="flex gap-2 items-center flex-wrap">
							<Button
								variant={filterValues.direction === "" ? "default" : "outline"}
								className=""
								onClick={() => {
									updateFilterValues("direction", "");
								}}
							>
								Tất cả
							</Button>
							{directions.map((dir, key) => (
								<Button
									key={key}
									variant={
										filterValues.direction === dir.value ? "default" : "outline"
									}
									className=""
									onClick={() => {
										updateFilterValues("direction", dir.value);
									}}
								>
									{dir.label}
								</Button>
							))}
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="categoryId">
						<AccordionTrigger className="text-lg font-semibold">
							Danh mục
						</AccordionTrigger>
						<AccordionContent className={`flex gap-2 flex-wrap`}>
							<Button
								variant={filterValues.categoryId === "" ? "default" : "outline"}
								className=""
								onClick={() => {
									updateFilterValues("categoryId", "");
								}}
							>
								Tất cả
							</Button>
							{categories &&
								categories?.map((cat: TCategory) => (
									<Button
										key={cat.id}
										variant={
											filterValues.categoryId === cat.id ? "default" : "outline"
										}
										className=""
										onClick={() => {
											updateFilterValues("categoryId", cat.id);
										}}
									>
										{cat.name}
									</Button>
								))}
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="width">
						<AccordionTrigger className="text-lg font-semibold">
							Chiều rộng
						</AccordionTrigger>
						<AccordionContent className="flex flex-col gap-4 text-nowrap">
							<div className="space-y-2">
								<div className="w-full flex items-center justify-between gap-2">
									<span className="text-sm text-muted-foreground">
										{widthRange[0]}
									</span>
									<Slider
										value={valueRange.width}
										onValueChange={(value) => {
											setValueRange((prev) => ({
												...prev,
												width: value as [number, number],
											}));
										}}
										max={widthRange[1]}
										step={10}
									/>
									<span className="text-sm text-muted-foreground">
										{widthRange[1]}
									</span>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="p-1 border-gray-200 border text-center rounded-md py-3">
										<p className="text-sm text-neutral-500">Tối thiểu</p>
										<p className="text-xl">{widthRange[0]} px</p>
									</div>
									<div className="p-1 border-gray-200 border text-center rounded-md py-3">
										<p className="text-sm text-neutral-500">Tối Đa</p>
										<p className="text-xl">{widthRange[1]} px</p>
									</div>
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="height">
						<AccordionTrigger className="text-lg font-semibold">
							Chiều Cao
						</AccordionTrigger>
						<AccordionContent className="flex flex-col gap-4 text-nowrap">
							<div>
								<div className="w-full flex items-center justify-between gap-2">
									<span className="text-sm text-muted-foreground">
										{heightRange[0]}
									</span>
									<Slider
										value={valueRange.height}
										onValueChange={(value) => {
											setValueRange((prev) => ({
												...prev,
												height: value as [number, number],
											}));
										}}
										max={heightRange[1]}
										step={10}
									/>
									<span className="text-sm text-muted-foreground">
										{heightRange[1]}
									</span>
								</div>
								<div className="grid grid-cols-2 mt-4 gap-3">
									<div className="p-1 border-gray-200 border text-center rounded-md py-3">
										<p className="text-sm text-neutral-500">Tối thiểu</p>
										<p className="text-xl">{heightRange[0]} px</p>
									</div>
									<div className="p-1 border-gray-200 border text-center rounded-md py-3">
										<p className="text-sm text-neutral-500">Tối Đa</p>
										<p className="text-xl">{heightRange[1]} px</p>
									</div>
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
					<div>
						<Button className="w-full mt-8 py-6" onClick={handleFilter}>
							Áp dụng bộ lọc
						</Button>
					</div>
				</Accordion>
			</div>
		</div>
	);
};

const SortSelector = () => {
	const searchParams = useSearchParams();
	const pathName = usePathname();
	const router = useRouter();
	const sortValue = searchParams.get("_order") || "desc";

	const handleSortChange = useCallback(
		(sortOrder: "asc" | "desc") => {
			const params = new URLSearchParams(searchParams.toString());
			params.set("_sort", "createdAt");
			params.set("_order", sortOrder);

			const url = `${pathName}?${params.toString()}`;

			router.push(url, { scroll: false });
		},
		[searchParams, pathName, router]
	);

	return (
		<Select
			defaultValue={sortValue}
			onValueChange={(e) => {
				handleSortChange(e as "asc" | "desc");
			}}
		>
			<SelectTrigger className="py-6 md:text-base md:font-semibold min-w-24">
				<SelectValue placeholder="Sắp xếp theo" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem className="md:text-base md:font-semibold" value="desc">
						Mới nhất
					</SelectItem>
					<SelectItem className="md:text-base md:font-semibold" value="asc">
						Cũ nhất
					</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

const ImageComponent = ({
	image,
	loading,
}: {
	image: TImage | null;
	loading?: boolean;
}) => {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);

	const ref = useRef<HTMLImageElement | null>(null);

	if (loading || error || !image) {
		return <Skeleton className="min-h-86 w-full" />;
	}

	return (
		<div
			className={`overflow-hidden rounded-lg transition-all hover:shadow-xl cursor-pointer shadow-xs duration-300 relative bg-gray-50/50 ${
				!loaded
					? "pointer-events-none hover:shadow-none"
					: "pointer-events-auto"
			}`}
		>
			{!loaded && <Skeleton className="min-h-full w-full" />}
			{
				<img
					ref={ref}
					src={image?.url}
					alt={image?.altText || "image"}
					className={`w-full object-center object-cover transition-all md:max-h-none max-h-200`}
					style={{ height: Math.min(image.height, maxHeight) }}
					onLoad={() => {
						setLoaded(true);
					}}
					onError={() => {
						setError(true);
					}}
				/>
			}
		</div>
	);
};

const ListImage = ({
	data,
	loading,
	ref,
	loadingMore,
	error,
	lastElementRef,
}: {
	data: TImage[];
	loading?: boolean;
	ref: { current: HTMLDivElement | null };
	loadingMore?: boolean;
	error?: Error | null;
	lastElementRef: { current: HTMLDivElement | null };
}) => {
	const isMobile = useIsMobile();

	const listCol = useMemo(() => {
		let cols = [[], [], []] as Array<TImage[]>;
		let heights = [0, 0, 0];

		if (isMobile) {
			cols = [[], []];
			heights = [0, 0];
		}

		for (const image of data) {
			const i = heights.indexOf(Math.min(...heights));
			cols[i].push(image);
			heights[i] += Math.min(image.height, maxHeight);
		}

		return cols;
	}, [data, isMobile]);

	useEffect(() => {
		const list = ref.current;
		if (!list) return;

		const gallery = new Viewer(list, {
			title: false,
		});

		return () => {
			gallery.destroy();
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, loadingMore]);

	if (loading) {
		return (
			<div className="grid md:grid-cols-3 sm:grid-cols-2 py-12">
				{Array.from({ length: isMobile ? 2 : 3 }).map((_, index) => (
					<div className="w-full" key={index}>
						{Array.from({ length: isMobile ? 5 : 10 }).map((_, key) => (
							<div key={key} className="p-3 transition-all">
								<ImageComponent image={null} loading={loading} />
							</div>
						))}
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex-1 text-center text-2xl py-24 text-red-500 font-semibold">
				<div className="size-20 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
					<Bug className="text-red-500" size={38} />
				</div>
				<h2 className="max-w-xl mx-auto">
					Không thể tải hình ảnh. Vui lòng thử lại sau.
				</h2>
			</div>
		);
	}

	return data.length ? (
		<div className="grid md:grid-cols-3 py-12 sm:grid-cols-2" ref={ref}>
			{listCol.map((cols, index) => (
				<div className="w-full flex flex-col gap-2" key={index}>
					{cols &&
						cols.map((item, key) => {
							return (
								<div key={key} className="p-3 transition-all">
									<ImageComponent image={item} loading={loading} />
								</div>
							);
						})}
					{loadingMore && (
						<div className="w-full" key={index}>
							{Array.from({ length: 10 }).map((_, key) => (
								<div key={key} className="p-3 transition-all">
									<ImageComponent image={null} loading={loadingMore} />
								</div>
							))}
						</div>
					)}
				</div>
			))}
			<div ref={lastElementRef} className="h-0.5 bg-transparent" />
		</div>
	) : (
		<div className="flex-1 text-center text-2xl py-24 text-neutral-400 font-semibold">
			<div className="size-20 bg-neutral-200 rounded-full mx-auto flex items-center justify-center mb-4">
				<Search className="text-neutral-400" size={38} />
			</div>
			<h2 className="max-w-xl mx-auto">
				Không tìm thấy hình ảnh nào. Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm
				kiếm.
			</h2>
		</div>
	);
};

function useFetchData({
	sortValue,
	searchParams,
}: {
	sortValue: string;
	searchParams: ReadonlyURLSearchParams;
}) {
	const paramsString = searchParams.toString();

	const isMobile = useIsMobile();

	const limitRef = useRef<number>(10);
	const isCalledInitialApi = useRef<boolean>(false);
	const limit = isMobile ? 15 : 30;

	const getApiUrl = useCallback(
		(page: number) => {
			const api = `/images?_page=${page}&_limit=${limit}${
				!paramsString.includes("_sort") && !paramsString.includes("_order")
					? `&_sort=createdAt&_order=${sortValue}`
					: ""
			}${paramsString ? `&${paramsString.replace("query", "q")}` : ""}`;

			return api;
		},

		[paramsString, sortValue, limit]
	);

	const { data, isLoading, setSize, size, error } = useSWRInfinite(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(index, _prevPage) => {
			return getApiUrl(index + 1);
		},
		fetcher
	);

	const {
		data: totalItems,
		error: error2,
		isLoading: isLoading2,
	} = useSWR(
		`/images?_start=0&${
			paramsString ? `&${paramsString.replace("query", "q")}` : ""
		}`,
		fetcher
	);

	const allData = useMemo(() => {
		return data ? data.flat() : [];
	}, [data]);

	if (isMobile) {
	}

	return {
		data: allData,
		loading: isLoading || isLoading2,
		error: error || error2,
		totalItems:
			(Array.isArray(totalItems) ? totalItems.length : totalItems?.total) || 0,
		limitRef,
		isCalledInitialApi,
		size,
		setSize,
	};
}

const ListImageContainer = () => {
	const [openFilter, setOpenFilter] = useState(false);

	const [loadingMore, setLoadingMore] = useState(false);

	const searchParams = useSearchParams();
	const pathName = usePathname();
	const router = useRouter();
	const sortValue = searchParams.get("_order") || "desc";

	const listRef = useRef<HTMLDivElement>(null);
	const lastElementRef = useRef<HTMLDivElement | null>(null);

	const { data, loading, error, totalItems, size, setSize } = useFetchData({
		sortValue,
		searchParams,
	});

	const isMobile = useIsMobile();

	const hasFilters = useMemo(() => {
		const params = Array.from(searchParams.entries());

		return params.filter(
			([key, value]) =>
				!["_sort", "_order", "_start", "_limit", "query"].includes(key) && value
		);
	}, [searchParams]);

	const handleShowMore = useCallback(async () => {
		if (
			loading ||
			loadingMore ||
			!data.length ||
			!lastElementRef.current ||
			data.length >= totalItems
		) {
			return;
		}

		try {
			setLoadingMore(true);
			await sleep(1000);
			setSize(size + 1);
			console.log("Load more images");
		} catch (error) {
			console.log(error);
		} finally {
			setTimeout(() => {
				setLoadingMore(false);
			}, 1000);
		}
	}, [setSize, size, loading, loadingMore, data, lastElementRef, totalItems]);

	useEffect(() => {
		const lastElement = lastElementRef.current;

		if (
			!lastElement ||
			loading ||
			!data.length ||
			loadingMore ||
			data.length >= totalItems
		) {
			return;
		}

		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				handleShowMore();
				console.log("Intersecting");
			}
		});

		observer.observe(lastElement);

		return () => {
			observer.disconnect();
		};
	}, [handleShowMore, loading, loadingMore, data, totalItems]);

	return (
		<div className="py-12 flex md:gap-4 md:px-0 px-2 relative">
			<div className="md:block hidden">
				<FilterPanel openFilter={openFilter} setOpenFilter={setOpenFilter} />
			</div>
			{isMobile && (
				<div className="md:hidden block">
					<Sheet open={openFilter} onOpenChange={setOpenFilter}>
						<SheetTrigger asChild>
							<span />
						</SheetTrigger>
						<SheetContent side="left" className="">
							<SheetHeader className="hidden">
								<SheetTitle />
								<SheetDescription />
							</SheetHeader>
							<div className="grid flex-1 auto-rows-min gap-6 px-4 max-h-full overflow-hidden overflow-y-auto md:pb-0 pb-4">
								<FilterPanel
									openFilter={openFilter}
									setOpenFilter={setOpenFilter}
								/>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			)}

			<div className={`flex-1`}>
				<div className="flex items-center justify-between">
					<ButtonGroup>
						<Button
							variant="outline"
							className="py-6 md:text-base font-normal md:font-medium"
							onClick={() => setOpenFilter(!openFilter)}
						>
							{!openFilter ? <Settings2 /> : <ArrowLeft />}
							{hasFilters.length ? `(${hasFilters.length})` : null} Bộ lọc
						</Button>

						{hasFilters.length ? (
							<Button
								variant="outline"
								className="py-6 md:text-base"
								onClick={() => router.push(pathName)}
							>
								<X />
							</Button>
						) : null}
					</ButtonGroup>
					<SortSelector />
				</div>
				<ListImage
					data={data}
					error={error}
					loading={loading}
					ref={listRef}
					loadingMore={loadingMore}
					lastElementRef={lastElementRef}
				/>
			</div>
		</div>
	);
};

export { ListImageContainer, ListImage };
