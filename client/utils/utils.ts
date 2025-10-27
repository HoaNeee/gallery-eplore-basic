export async function sleep(duration: number = 100) {
	return await new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

export async function getImageSize(url: string) {
	return new Promise<{ width: number; height: number }>((resolve) => {
		const img = new Image();
		img.onload = () => {
			resolve({ width: img.width, height: img.height });
		};
		img.src = url;
	});
}
