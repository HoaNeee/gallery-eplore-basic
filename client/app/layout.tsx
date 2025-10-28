import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/app-header";
import { Suspense } from "react";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Explore Gallery",
	description: "A simple image exploring gallery",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Suspense
					fallback={
						<header className="sticky py-11 px-4 border-muted border-b top-0 left-0 w-full bg-white z-10 self-start"></header>
					}
				>
					<AppHeader />
				</Suspense>
				<main className="h-full">{children}</main>
			</body>
		</html>
	);
}
