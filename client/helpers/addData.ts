import { post } from "@/utils/request";
import { sampleData, sampleDataCat, sampleDataDog } from "../data/sample-data";
import { getImageSize } from "@/utils/utils";

// const catIds = ["1", "2", "3"];

export const addImages = async () => {
	try {
		for (const image of sampleDataDog) {
			const url = image.url;
			const ranCatId = "2";
			const tags = ["dog", "animal"];
			const { width, height } = await getImageSize(url);
			const direction =
				width > height ? "landscape" : width < height ? "portrait" : "square";
			const createdAt = new Date().toISOString();
			const updatedAt = new Date().toISOString();
			const altText = `Sample dog image ${tags.join(" ")} ${Math.floor(
				Math.random() * 1000
			)}`;
			const payload = {
				url,
				category: ranCatId,
				tags: tags.join(","),
				height,
				width,
				createdAt,
				updatedAt,
				altText,
				direction,
			};
			await post("/images", payload);
		}
		for (const image of sampleData) {
			const url = image.url;
			const ranCatId = "1";
			const tags = image.tags;
			const { width, height } = await getImageSize(url);
			const direction =
				width > height ? "landscape" : width < height ? "portrait" : "square";
			const createdAt = new Date().toISOString();
			const updatedAt = new Date().toISOString();
			const altText = `Sample image anime ${tags.join(" ")} ${Math.floor(
				Math.random() * 1000
			)}`;
			const payload = {
				url,
				category: ranCatId,
				tags: tags.join(","),
				height,
				width,
				createdAt,
				updatedAt,
				altText,
				direction,
			};
			await post("/images", payload);
		}
		for (const image of sampleDataCat) {
			const url = image.url;
			const ranCatId = "2";
			const tags = ["cat", "animal"];
			const { width, height } = await getImageSize(url);
			const direction =
				width > height ? "landscape" : width < height ? "portrait" : "square";
			const createdAt = new Date().toISOString();
			const updatedAt = new Date().toISOString();
			const altText =
				"Sample cat image " +
				tags.join(" ") +
				" " +
				Math.floor(Math.random() * 1000);
			const payload = {
				url,
				category: ranCatId,
				tags: tags.join(","),
				height,
				width,
				createdAt,
				updatedAt,
				altText,
				direction,
			};
			await post("/images", payload);
		}
		console.log("done");
	} catch (error) {
		console.log("Add images error at addData.ts: ", error);
	}
};

export const addCategories = async () => {
	try {
		const categories = [
			{
				id: "1",
				name: "Hoạt hình",
				slug: "hoat-hinh",
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z",
			},
			{
				id: "2",
				name: "Thiên nhiên",
				slug: "thien-nhien",
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z",
			},
			{
				id: "3",
				name: "Động vật",
				slug: "dong-vat",
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z",
			},
		];

		for (const category of categories) {
			await post("/categories", category);
		}
	} catch (error) {
		console.log("Add categories error at addData.ts: ", error);
	}
};
