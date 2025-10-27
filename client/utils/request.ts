/* eslint-disable @typescript-eslint/no-explicit-any */

export const DOMAIN =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const BASE_URL = `${DOMAIN}`;

export const fetcher = async (url: string) => {
	const newUrl =
		url.startsWith("http://") || url.startsWith("https://")
			? url
			: `${BASE_URL}${url}`;
	return fetch(newUrl).then((res) => res.json());
};

export const get = async (url: string, config?: RequestInit) => {
	try {
		let api = "";
		if (url.startsWith("http://") || url.startsWith("https://")) {
			api = url;
		} else {
			api = `${BASE_URL}${url}`;
		}

		const response = await fetch(api, {
			method: "GET",
			...config,
		});

		const total = response.headers.get("x-total-count");

		if (!response.ok) {
			throw new Error(response.statusText || "Internal Server Error");
		}

		let result = await response.json();
		// if (!result.success) {
		// 	throw result.error || result.message || new Error("Request failed");
		// }

		if (total) {
			result = {
				data: result,
				total: Number(total),
			};
		}

		return result;
	} catch (error) {
		console.log("Request GET error at request.ts: ", error);
		throw error instanceof Error ? error.message || error : error;
	}
};

export const post = async (
	url: string,
	options?: Record<string, any>,
	config?: RequestInit
) => {
	try {
		let api = "";
		if (url.startsWith("http://") || url.startsWith("https://")) {
			api = url;
		} else {
			api = `${BASE_URL}${url}`;
		}
		const response = await fetch(api, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(options),
			...config,
		});

		if (!response.ok) {
			throw new Error(response.statusText || "Internal Server Error");
		}

		const contentType = response.headers.get("Content-Type");

		if (contentType === "text/event-stream") {
			const reader = response.body?.getReader();
			return reader;
		}

		const result = await response.json();

		// if (!result.success) {
		// 	throw result.error || result.message || new Error("Request failed");
		// }

		return result;
	} catch (error: any) {
		console.log("Request POST error at request.ts: ", error);
		throw error instanceof Error ? error.message || error : error;
	}
};

export const patch = async (
	url: string,
	options?: Record<string, any>,
	config?: RequestInit
) => {
	try {
		let api = "";
		if (url.startsWith("http://") || url.startsWith("https://")) {
			api = url;
		} else {
			api = `${BASE_URL}${url}`;
		}
		const response = await fetch(api, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(options),
			...config,
		});

		if (!response.ok) {
			throw new Error(response.statusText || "Internal Server Error");
		}

		const result = await response.json();

		// if (!result.success) {
		// 	throw result.error || result.message || new Error("Request failed");
		// }

		return result;
	} catch (error) {
		console.log("Request PATCH error at request.ts: ", error);
		throw error instanceof Error ? error.message || error : error;
	}
};

export const del = async (
	url: string,
	options?: Record<string, any>,
	config?: RequestInit
) => {
	try {
		let api = "";
		if (url.startsWith("http://") || url.startsWith("https://")) {
			api = url;
		} else {
			api = `${BASE_URL}${url}`;
		}
		const response = await fetch(api, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(options),
			...config,
		});

		if (!response.ok) {
			throw new Error(response.statusText || "Internal Server Error");
		}

		const result = await response.json();

		// if (!result.success) {
		// 	throw result.error || result.message || new Error("Request failed");
		// }

		return result;
	} catch (error) {
		console.log("Request DELETE error at request.ts: ", error);
		throw error instanceof Error ? error.message || error : error;
	}
};
