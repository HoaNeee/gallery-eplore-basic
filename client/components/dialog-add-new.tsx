"use client";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Button, ButtonTransition } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileUploadComponent } from "./file-upload-component";
import { useRouter } from "next/navigation";
import { TCategory } from "@/types/category.types";
import { fetcher, post } from "@/utils/request";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { ChevronDown, Plus, X } from "lucide-react";
import { getImageSize } from "@/utils/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Textarea } from "./ui/textarea";
import useSWR, { mutate } from "swr";

const isAccessURL = (url: string) => {
	if (!url.trim()) {
		return false;
	}

	const validExtensions = [
		".jpg",
		".jpeg",
		".png",
		".gif",
		".bmp",
		".webp",
		".svg",
	];

	return (
		(url.startsWith("http://") || url.startsWith("https://")) &&
		validExtensions.some((ext) => url.endsWith(ext))
	);
};

const initialObjectUrl = {
	url: "",
	altText: "Sample Image description",
	category: "",
	tags: [] as string[],
};

type ObjectUrl = typeof initialObjectUrl;

const SelectTags = ({
	tags,
	setObjectUrl,
	objectUrl,
}: {
	tags: string[];
	setObjectUrl: React.Dispatch<React.SetStateAction<ObjectUrl>>;
	objectUrl: ObjectUrl;
}) => {
	const [isFocused, setIsFocused] = useState(false);
	const [value, setValue] = useState("");
	const [filteredTags, setFilteredTags] = useState<string[]>(tags || []);

	useEffect(() => {
		if (!ref.current) {
			return;
		}

		if (!Array.isArray(tags)) {
			return;
		}

		if (!value) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setFilteredTags(tags || []);
			return;
		}
		setFilteredTags(
			tags.filter((tag) => tag.toLowerCase().includes(value.toLowerCase()))
		);
	}, [value, tags]);

	const ref = useRef<HTMLInputElement | null>(null);

	const saveTags = useCallback(() => {
		if (!value.trim()) {
			return;
		}

		setObjectUrl((prev) => {
			if (prev.tags.includes(value.trim())) {
				return prev;
			}
			return { ...prev, tags: [...prev.tags, value.trim()] };
		});
		setValue("");
	}, [value, setObjectUrl]);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				saveTags();
			}
		},
		[saveTags]
	);

	return (
		<>
			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Input
						placeholder="Enter tags separated by commas"
						className="pr-8"
						ref={ref}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={onKeyDown}
					/>
					<ChevronDown
						size={18}
						className="absolute text-neutral-500 right-2 top-1/2 transform -translate-y-1/2"
					/>
					<div
						className="absolute top-10 left-0 w-full h-40 bg-white shadow-lg border border-neutral-200 rounded-md p-2 z-10 text-sm"
						style={{ display: isFocused ? "block" : "none" }}
						onPointerDown={(e) => {
							e.preventDefault();
						}}
					>
						{filteredTags.length ? (
							<div className="flex flex-col gap-1 max-h-full overflow-y-auto">
								{filteredTags.map((tag, key) => (
									<button
										key={key}
										className={`cursor-pointer py-1 px-2 hover:bg-neutral-100 w-full text-left rounded transition-colors ${
											objectUrl.tags.includes(tag)
												? "bg-neutral-100 hover:bg-neutral-200"
												: ""
										}`}
										onClick={() => {
											setObjectUrl((prev) => {
												if (prev.tags.includes(tag)) {
													return {
														...prev,
														tags: prev.tags.filter((t) => t !== tag),
													};
												}
												return { ...prev, tags: [...prev.tags, tag] };
											});
										}}
									>
										{tag}
									</button>
								))}
							</div>
						) : (
							<div className="w-full h-full flex items-center justify-center text-neutral-500">
								Thẻ không tìm thấy
							</div>
						)}
					</div>
				</div>
				<Button variant={"outline"} onClick={saveTags}>
					Lưu thẻ
				</Button>
			</div>
			<div className="flex items-center gap-2 mt-4 flex-wrap">
				{objectUrl.tags.map((tag, key) => {
					return (
						<div
							key={key}
							className="bg-neutral-100 text-neutral-800 py-1 px-2 rounded-md text-sm relative"
						>
							{tag}
							<button
								className="absolute top-0 right-0 -mt-1 -mr-1 bg-neutral-200 rounded-full size-4 flex items-center justify-center hover:bg-neutral-300 cursor-pointer"
								onClick={() => {
									setObjectUrl((prev) => {
										return {
											...prev,
											tags: prev.tags.filter((_, i) => i !== key),
										};
									});
								}}
							>
								<X size={12} />
							</button>
						</div>
					);
				})}
			</div>
		</>
	);
};

const DialogAddNewCategory = ({
	open,
	setOpen,
	onAddNew,
}: {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onAddNew?: (val: { name: string; description?: string }) => void;
}) => {
	const [data, setData] = useState({
		name: "",
		description: "",
	});

	const handAddNewCategory = useCallback(
		async (val: { name: string; description?: string }) => {
			try {
				const slug = val.name
					.toLowerCase()
					.trim()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-+|-+$/g, "");

				const payload = {
					name: val.name,
					slug,
					description: val.description || "",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};
				await post("/categories", payload);
				setOpen(false);
				mutate("/categories");
			} catch (error) {
				console.log(error);
			}
		},
		[setOpen]
	);

	useEffect(() => {
		if (!open) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setData({ name: "", description: "" });
		}

		return () => {
			setData({ name: "", description: "" });
		};
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<span />
			</DialogTrigger>
			<DialogContent
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						if (data.name.trim()) {
							onAddNew?.(data);
						}
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>Thêm danh mục mới</DialogTitle>
					<DialogDescription />
				</DialogHeader>
				<div className="space-y-4 py-2">
					<div className="space-y-2">
						<Label htmlFor="name-category">Name</Label>
						<Input
							id="name-category"
							value={data.name}
							onChange={(e) => setData({ ...data, name: e.target.value })}
							placeholder="Enter name category"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={data.description}
							onChange={(e) =>
								setData({ ...data, description: e.target.value })
							}
							placeholder="Write description about this category..."
						/>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant={"outline"}>Cancel</Button>
					</DialogClose>
					<Button
						onClick={() => {
							handAddNewCategory(data);
						}}
						disabled={!data.name.trim()}
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const SelectCategory = ({
	categories,
	handleChangeValue,
	setOpenDialogAddCategory,
}: {
	categories: TCategory[];
	handleChangeValue: (
		key: keyof typeof initialObjectUrl,
		value: string
	) => void;
	setOpenDialogAddCategory: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	return (
		<Select onValueChange={(value) => handleChangeValue("category", value)}>
			<SelectTrigger className="flex-1 w-full">
				<SelectValue placeholder="Select category" />
				<SelectContent className="max-h-86 overflow-hidden overflow-y-auto">
					<div className="text-sm text-right pb-2 w-full">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size={"icon-sm"}
									variant={"ghost"}
									className="size-5 text-neutral-500 rounded-xs"
									onClick={() => setOpenDialogAddCategory(true)}
								>
									<Plus />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Thêm danh mục</TooltipContent>
						</Tooltip>
					</div>
					{categories &&
						categories.map((category) => (
							<SelectItem key={category.id} value={category.id}>
								{category.name}
							</SelectItem>
						))}
				</SelectContent>
			</SelectTrigger>
		</Select>
	);
};

const DialogAddNewImage = () => {
	const [action, setAction] = useState<"none" | "url" | "upload">("none");
	const [files, setFiles] = useState<File[]>([]);
	const [objectUrl, setObjectUrl] = useState<ObjectUrl>(initialObjectUrl);
	const [open, setOpen] = useState(false);
	const [tags, setTags] = useState<string[]>([]);

	const [openDialogAddCategory, setOpenDialogAddCategory] = useState(false);

	const { data: categories } = useSWR(
		"/categories?_sort=createdAt&_order=desc",
		fetcher
	);
	const { data: images } = useSWR("/images", fetcher);

	const isUrl = action === "url";
	const isUpload = action === "upload";

	function resetAction() {
		setAction("none");
		setObjectUrl(initialObjectUrl);
	}

	const disabled = useMemo(() => {
		return (
			!objectUrl.altText ||
			(!isAccessURL(objectUrl.url) && isUrl) ||
			(isUpload && !files.length) ||
			!objectUrl.category
		);
	}, [objectUrl, files, isUrl, isUpload]);

	const router = useRouter();

	useEffect(() => {
		if (images && images.length) {
			const tagsSet = new Set<string>();
			if (Array.isArray(images)) {
				for (const img of images) {
					const imgTags =
						img.tags?.split(",").filter((tag: string) => tag.trim()) || [];
					imgTags.forEach((tag: string) => tagsSet.add(tag.trim()));
				}
			}
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setTags(Array.from(tagsSet).sort((a, b) => a.localeCompare(b)));
		}
	}, [images]);

	useEffect(() => {
		if (!open) {
			setTimeout(() => {
				resetAction();
				setFiles([]);
			}, 0);
		}
	}, [open]);

	const handleChangeValue = useCallback(
		(key: keyof typeof objectUrl, value: string) => {
			setObjectUrl((prev) => ({ ...prev, [key]: value }));
		},
		[]
	);

	const renderContent = useCallback(() => {
		if (isUrl) {
			return (
				<div className="space-y-2 md:max-w-2/3 mx-auto w-full py-2">
					<div className="flex items-center gap-2 w-full">
						<Label htmlFor="image-url" className="font-normal w-1/4">
							Image URL:
						</Label>
						<Input
							id="image-url"
							placeholder="Enter image url"
							className="flex-1"
							value={objectUrl.url || ""}
							onChange={(e) => {
								const value = e.target.value;
								handleChangeValue("url", value);
							}}
						/>
					</div>
					<div className="flex items-center gap-2 w-full ">
						<Label htmlFor="image-alt" className="font-normal w-1/4">
							Alt Text:
						</Label>
						<Input
							id="image-alt"
							placeholder="Enter image alt text"
							value={objectUrl.altText || ""}
							className="flex-1"
							onChange={(e) => {
								const value = e.target.value;
								handleChangeValue("altText", value);
							}}
						/>
					</div>
					<div className="flex items-center gap-2 w-full ">
						<Label className="font-normal w-1/4">Category</Label>
						<SelectCategory
							categories={categories}
							handleChangeValue={handleChangeValue}
							setOpenDialogAddCategory={setOpenDialogAddCategory}
						/>
					</div>
					<div className="space-y-2 mt-6">
						<Label className="font-normal w-1/4">Tags</Label>
						<SelectTags
							tags={tags}
							setObjectUrl={setObjectUrl}
							objectUrl={objectUrl}
						/>
					</div>
				</div>
			);
		}

		if (isUpload) {
			return (
				<div className="w-full h-full space-y-4">
					<FileUploadComponent files={files} setFiles={setFiles} />
					<div className="space-y-2 flex flex-col w-full">
						<Label>Category</Label>
						<SelectCategory
							categories={categories}
							handleChangeValue={handleChangeValue}
							setOpenDialogAddCategory={setOpenDialogAddCategory}
						/>
					</div>
					<div className="space-y-2">
						<Label>Tags</Label>
						<SelectTags
							tags={tags}
							setObjectUrl={setObjectUrl}
							objectUrl={objectUrl}
						/>
					</div>
				</div>
			);
		}
		return (
			<div className="flex flex-col gap-3 max-w-1/2 mx-auto w-full my-4">
				<Button variant={"outline"} onClick={() => setAction("url")}>
					URL
				</Button>
				<Button variant={"outline"} onClick={() => setAction("upload")}>
					Upload File
				</Button>
			</div>
		);
	}, [isUrl, isUpload, objectUrl, files, categories, handleChangeValue, tags]);

	const confirmInsert = useCallback(async () => {
		if (disabled) {
			console.log("Please fill in all fields");
			return;
		}

		if (isUpload) {
			if (files && files.length) {
				const promises = [];
				for (const file of files) {
					const src = URL.createObjectURL(file);
					const { width, height } = await getImageSize(src);
					const direction =
						width > height
							? "landscape"
							: width < height
							? "portrait"
							: "square";
					const payload = {
						url: src,
						altText: file.name,
						category: objectUrl.category,
						tags: objectUrl.tags.join(","),
						width,
						height,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						direction,
					};

					promises.push(async () => {
						return await post("/images", payload);
					});
				}
				await Promise.all(promises.map((p) => p()));
			}
			setOpen(false);
			router.refresh();
			return;
		}

		if (isUrl) {
			if (objectUrl.url.trim() !== "") {
				const { width, height } = await getImageSize(objectUrl.url);
				const direction =
					width > height ? "landscape" : width < height ? "portrait" : "square";
				const payload = {
					url: objectUrl.url,
					altText: objectUrl.altText,
					category: objectUrl.category,
					tags: objectUrl.tags.join(","),
					width,
					height,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					direction,
				};
				await post("/images", payload);
			}
		}

		setOpen(false);
		router.refresh();
	}, [objectUrl, isUpload, isUrl, files, router, disabled]);

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<ButtonTransition>Thêm ảnh mới</ButtonTransition>
				</DialogTrigger>
				<DialogContent
					onKeyDown={(e) => {
						if (e.key === "Enter" && !(e.altKey || e.ctrlKey)) {
							confirmInsert();
						}
					}}
				>
					<DialogHeader>
						<DialogTitle>Thêm hình ảnh mới</DialogTitle>
						<DialogDescription />
					</DialogHeader>
					{renderContent()}
					<DialogFooter>
						<DialogClose asChild>
							<Button variant={"outline"}>Cancel</Button>
						</DialogClose>

						<Button onClick={confirmInsert} disabled={disabled}>
							Confirm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<DialogAddNewCategory
				open={openDialogAddCategory}
				setOpen={setOpenDialogAddCategory}
			/>
		</>
	);
};

export default DialogAddNewImage;
