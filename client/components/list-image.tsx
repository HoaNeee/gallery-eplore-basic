/* eslint-disable @next/next/no-img-element */
"use client";

import { fetcher, get } from "@/utils/request";
import React, {
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

const ImageComponent = ({
	image,
	loading,
}: {
	image: TImage | null;
	loading?: boolean;
}) => {
	const [loaded, setLoaded] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		const img = new Image();
		img.onload = () => setLoaded(false);
		img.onerror = () => setError(true);
		img.src = image?.url || "";
	}, [image]);

	if (loading || error || loaded || !image) {
		return <Skeleton className="min-h-100 w-full" />;
	}

	return (
		<div
			className={`overflow-hidden rounded-lg transition-all hover:shadow-xl cursor-pointer shadow-xs duration-300`}
		>
			<img
				src={image?.url}
				alt={image?.altText || "image"}
				className="w-full h-full object-cover transition-all min-h-76"
			/>
		</div>
	);
};

const FilterPanel = ({
	openFilter,
}: {
	openFilter: boolean;
	setOpenFilter: Dispatch<boolean>;
}) => {
	const [categories, setCategories] = useState<TCategory[]>([]);
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
		const fetchData = async () => {
			try {
				const res = await get("/categories");
				setCategories(Array.isArray(res) ? res : []);

				const [maxHeight, minHeight, maxWidth, minWidth] = await Promise.all([
					get("/images?_sort=height&_order=desc&_limit=1"),
					get("/images?_sort=height&_order=asc&_limit=1"),
					get("/images?_sort=width&_order=desc&_limit=1"),
					get("/images?_sort=width&_order=asc&_limit=1"),
				]);

				const minHeightData =
					minHeight.data?.[0]?.height || minHeight[0]?.height || 0;
				const maxHeightData =
					maxHeight.data?.[0]?.height || maxHeight[0]?.height || 1000;
				const minWidthData =
					minWidth.data?.[0]?.width || minWidth[0]?.width || 0;
				const maxWidthData =
					maxWidth.data?.[0]?.width || maxWidth[0]?.width || 1000;

				setHeightRange([minHeightData, maxHeightData]);
				setWidthRange([minWidthData, maxWidthData]);
				updateInitialValuesFilter(
					minWidthData,
					maxWidthData,
					minHeightData,
					maxHeightData
				);
			} catch (error) {
				console.log("Error fetching categories:", error);
			}
		};

		fetchData();
	}, [updateInitialValuesFilter]);

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
		<>
			<div
				style={{
					maxWidth: openFilter ? "280px" : 0,
					width: "100%",
					opacity: openFilter ? 1 : 0,
					pointerEvents: openFilter ? "auto" : "none",
					whiteSpace: "nowrap",
				}}
				className="transition-all duration-300 ease-in-out overflow md:sticky md:top-18 md:mt-0 mt-8 self-start"
			>
				<Accordion
					type="multiple"
					className="w-full max-h-full overflow-hidden overflow-y-auto"
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
							{categories.map((cat) => (
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
				</Accordion>
				<div>
					<Button className="w-full mt-4 py-6" onClick={handleFilter}>
						Áp dụng bộ lọc
					</Button>
				</div>
			</div>
		</>
	);
};

const ListImage = ({
	data,
	loading,
	ref,
	loadingMore,
	error,
}: {
	data: { col1: TImage[]; col2: TImage[]; col3: TImage[] };
	loading?: boolean;
	ref: { current: HTMLDivElement | null };
	loadingMore?: boolean;
	error?: Error | null;
}) => {
	const isMobile = useIsMobile();

	const listCol = useMemo(() => {
		if (isMobile) {
			const cols1 = data?.col1;
			const cols2 = data?.col2;
			return [cols1, cols2];
		}
		const cols1 = data?.col1;
		const cols2 = data?.col2;
		const cols3 = data?.col3;
		return [cols1, cols2, cols3];
	}, [data, isMobile]);

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

	const totalLength = data.col1.length + data.col2.length + data.col3.length;

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

	return totalLength ? (
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
							{Array.from({ length: 5 }).map((_, key) => (
								<div key={key} className="p-3 transition-all">
									<ImageComponent image={null} loading={loadingMore} />
								</div>
							))}
						</div>
					)}
				</div>
			))}
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

const initialFilterValues = {
	direction: "",
	categoryId: "",
};

function useFetchInitialData({
	sortValue,
	searchParams,
}: {
	sortValue: string;
	searchParams: ReadonlyURLSearchParams;
}) {
	const paramsString = searchParams.toString();

	const startCol1Ref = useRef<number>(0);
	const startCol2Ref = useRef<number>(10);
	const startCol3Ref = useRef<number>(20);
	const limitRef = useRef<number>(10);
	const limit = 10;

	const isMobile = useIsMobile();

	useEffect(() => {
		if (isMobile) {
			limitRef.current = 5;
		} else {
			limitRef.current = 10;
		}
	}, [isMobile]);

	const {
		data: col1,
		error: error1,
		isLoading: isLoading1,
	} = useSWR(
		`/images?_start=0&_limit=${limit}${
			!paramsString.includes("_sort") && !paramsString.includes("_order")
				? `&_sort=createdAt&_order=${sortValue}`
				: ""
		}${paramsString ? `&${paramsString.replace("query", "q")}` : ""}`,
		fetcher
	);
	const {
		data: col2,
		error: error2,
		isLoading: isLoading2,
	} = useSWR(
		`/images?_start=10&_limit=${limit}${
			!paramsString.includes("_sort") && !paramsString.includes("_order")
				? `&_sort=createdAt&_order=${sortValue}`
				: ""
		}${paramsString ? `&${paramsString.replace("query", "q")}` : ""}`,
		fetcher
	);
	const {
		data: col3,
		error: error3,
		isLoading: isLoading3,
	} = useSWR(
		`/images?_start=20&_limit=${limit}${
			!paramsString.includes("_sort") && !paramsString.includes("_order")
				? `&_sort=createdAt&_order=${sortValue}`
				: ""
		}${paramsString ? `&${paramsString.replace("query", "q")}` : ""}`,
		isMobile ? null : fetcher
	);
	const {
		data: totalItems,
		error: error4,
		isLoading: isLoading4,
	} = useSWR(
		`/images?_start=0&${
			paramsString ? `&${paramsString.replace("query", "q")}` : ""
		}`,
		fetcher
	);

	if (error1 || error2 || error3 || error4) {
		return {
			data: null,
			loading: false,
			error: error1 || error2 || error3 || error4,
			startCol1Ref,
			startCol2Ref,
			startCol3Ref,
			totalItems: 0,
			limitRef,
		};
	}

	if (isMobile) {
		return {
			data: {
				col1: (col1 as TImage[]) || [],
				col2: (col2 as TImage[]) || [],
				col3: [],
			},
			loading: isLoading1 || isLoading2 || isLoading3 || isLoading4,
			error: null,
			startCol1Ref,
			startCol2Ref,
			startCol3Ref,
			totalItems:
				(Array.isArray(totalItems) ? totalItems.length : totalItems?.total) ||
				0,
			limitRef,
		};
	}

	return {
		data: {
			col1: (col1 as TImage[]) || [],
			col2: (col2 as TImage[]) || [],
			col3: (col3 as TImage[]) || [],
		},
		loading: isLoading1 || isLoading2 || isLoading3 || isLoading4,
		error: null,
		startCol1Ref,
		startCol2Ref,
		startCol3Ref,
		totalItems:
			(Array.isArray(totalItems) ? totalItems.length : totalItems?.total) || 0,
		limitRef,
	};
}

const ListImageContainer = () => {
	const [openFilter, setOpenFilter] = useState(false);

	const [data, setdata] = useState<{
		col1: TImage[];
		col2: TImage[];
		col3: TImage[];
	}>({ col1: [], col2: [], col3: [] });
	const [totalItems, setTotalItems] = useState(10);
	const [loadingMore, setLoadingMore] = useState(false);

	const searchParams = useSearchParams();
	const pathName = usePathname();
	const router = useRouter();
	const sortValue = searchParams.get("_order") || "desc";

	const {
		data: initialData,
		loading,
		error,
		totalItems: totalItemsInitial,
		startCol1Ref,
		startCol2Ref,
		startCol3Ref,
		limitRef,
	} = useFetchInitialData({
		sortValue,
		searchParams,
	});

	const isMobile = useIsMobile();

	const listRef = useRef<HTMLDivElement>(null);

	const hasFilters = useMemo(() => {
		const params = Array.from(searchParams.entries());

		return params.filter(
			([key, value]) =>
				!["_sort", "_order", "_start", "_limit", "query"].includes(key) && value
		);
	}, [searchParams]);

	const getImages = useCallback(
		async (start = 0) => {
			try {
				const paramsString = searchParams.toString();
				const api = `/images?_start=${start}&_limit=${limitRef.current}${
					!paramsString.includes("_sort") && !paramsString.includes("_order")
						? `&_sort=createdAt&_order=${sortValue}`
						: ""
				}${paramsString ? `&${paramsString.replace("query", "q")}` : ""}`;
				const res = await get(api);

				if (Array.isArray(res)) {
					return { data: res, total: res.length };
				} else {
					return res as {
						data: TImage[];
						total: number;
					};
				}
			} catch (error) {
				throw error;
			}
		},
		[searchParams, sortValue, limitRef]
	);

	const handleShowMore = useCallback(async () => {
		try {
			setLoadingMore(true);
			await sleep(1000);

			if (isMobile) {
				limitRef.current = 5;
				startCol1Ref.current = startCol2Ref.current;
				startCol2Ref.current = startCol1Ref.current + 10;
				const [newCol1, newCol2] = await Promise.all([
					getImages(startCol1Ref.current),
					getImages(startCol2Ref.current),
				]);
				setdata((prev) => {
					const col1 = [...prev.col1, ...newCol1.data];
					const col2 = [...prev.col2, ...newCol2.data];
					return { col1, col2, col3: [] };
				});
			} else {
				limitRef.current = 10;
				startCol1Ref.current = startCol3Ref.current;
				startCol2Ref.current = startCol1Ref.current + 10;
				startCol3Ref.current = startCol2Ref.current + 10;
				const [newCol1, newCol2, newCol3] = await Promise.all([
					getImages(startCol1Ref.current),
					getImages(startCol2Ref.current),
					getImages(startCol3Ref.current),
				]);
				setdata((prev) => {
					const col1 = [...prev.col1, ...newCol1.data];
					const col2 = [...prev.col2, ...newCol2.data];
					const col3 = [...prev.col3, ...newCol3.data];
					return { col1, col2, col3 };
				});
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoadingMore(false);
		}
	}, [getImages, isMobile, startCol1Ref, startCol2Ref, startCol3Ref, limitRef]);

	const scrollBottom = useCallback(() => {
		const list = listRef.current;

		const curr_totalItems =
			(data.col1.length || 0) +
			(data.col2.length || 0) +
			(data.col3.length || 0);

		if (
			!list ||
			loading ||
			!curr_totalItems ||
			curr_totalItems >= totalItems ||
			loadingMore
		) {
			return;
		}

		const heightScroll = window.scrollY + window.innerHeight;
		const listHeight = list.clientHeight + list.offsetTop;

		if (heightScroll + 100 >= listHeight) {
			handleShowMore();
		}
	}, [loading, data, totalItems, handleShowMore, loadingMore]);

	useEffect(() => {
		const list = listRef.current;

		if (
			!list ||
			loading ||
			(data.col1.length === 0 &&
				data.col2.length === 0 &&
				data.col3.length === 0) ||
			loadingMore
		) {
			return;
		}

		window.addEventListener("scroll", scrollBottom);

		return () => {
			window.removeEventListener("scroll", scrollBottom);
		};
	}, [data, scrollBottom, loading, loadingMore]);

	useEffect(() => {
		console.log(data);
		if (initialData && data.col1.length === 0 && !loading) {
			setTotalItems(totalItemsInitial);
			setdata(initialData);
		}
	}, [initialData, loading, data, totalItemsInitial]);

	// useEffect(() => {
	// 	const fetchDataInitial = async () => {
	// 		setLoading(true);

	// 		try {
	// 			startCol1Ref.current = 0;
	// 			startCol2Ref.current = 10;
	// 			startCol3Ref.current = 20;
	// 			await sleep(1000);

	// 			if (isMobile) {
	// 				limit.current = 15;
	// 				const [col1, col2] = await Promise.all([
	// 					getImages(startCol1Ref.current),
	// 					getImages(startCol2Ref.current),
	// 				]);
	// 				setdata({ col1: col1.data, col2: col2.data, col3: [] });
	// 				setTotalItems(col1.total || col2.total || 10);
	// 			} else {
	// 				limit.current = 30;
	// 				const [col1, col2, col3] = await Promise.all([
	// 					getImages(startCol1Ref.current),
	// 					getImages(startCol2Ref.current),
	// 					getImages(startCol3Ref.current),
	// 				]);
	// 				setdata({ col1: col1.data, col2: col2.data, col3: col3.data });
	// 				setTotalItems(col1.total || col2.total || col3.total || 10);
	// 			}
	// 		} catch (error) {
	// 			console.error("Error fetching data:", error);
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};

	// 	fetchDataInitial();
	// }, [getImages, isMobile, startCol1Ref, startCol2Ref, startCol3Ref]);

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
							<div className="grid flex-1 auto-rows-min gap-6 px-4">
								<FilterPanel
									openFilter={openFilter}
									setOpenFilter={setOpenFilter}
								/>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			)}

			<div className="flex-1">
				<div className="flex items-center justify-between">
					<ButtonGroup>
						<Button
							variant="outline"
							className="py-6 text-base"
							onClick={() => setOpenFilter(!openFilter)}
						>
							{!openFilter ? <Settings2 /> : <ArrowLeft />}
							{hasFilters.length ? `(${hasFilters.length})` : null} Bộ lọc
						</Button>

						{hasFilters.length ? (
							<Button
								variant="outline"
								className="py-6 text-base"
								onClick={() => router.push(pathName)}
							>
								<X />
							</Button>
						) : null}
					</ButtonGroup>
					<Select
						defaultValue={sortValue}
						onValueChange={(e) => {
							handleSortChange(e as "asc" | "desc");
						}}
					>
						<SelectTrigger className="py-6 text-base font-semibold min-w-24">
							<SelectValue placeholder="Sắp xếp theo" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem className="text-base font-semibold" value="desc">
									Mới nhất
								</SelectItem>
								<SelectItem className="text-base font-semibold" value="asc">
									Cũ nhất
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				<ListImage
					data={data}
					error={error}
					loading={loading}
					ref={listRef}
					loadingMore={loadingMore}
				/>
			</div>
		</div>
	);
};

export { ListImageContainer, ListImage };
