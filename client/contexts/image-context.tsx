import { TImage } from "@/types/image.types";
import { createContext, useState } from "react";

type ImageContextType = {
	state: {
		images: TImage[];
	};
};

const Context = createContext<ImageContextType | undefined>(undefined);

const ImageContext = ({ children }: { children: React.ReactNode }) => {
	const [images, setImages] = useState<TImage[]>([]);

	const value = {
		state: {
			images,
		},
	};
	return <Context.Provider value={value}>{children}</Context.Provider>;
};
