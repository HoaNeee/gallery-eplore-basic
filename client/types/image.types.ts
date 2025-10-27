export type TImage = {
	id: string;
	url: string;
	altText: string;
	description?: string;
	width: number;
	height: number;
	category: string;
	tags: string[];
	direction: "landscape" | "portrait" | "square";
	createdAt: string;
	updatedAt: string;
};
