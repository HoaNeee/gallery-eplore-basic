"use client";

import { aliasName } from "@/utils/contants";
import Link from "next/link";
import DialogAddNewImage from "./dialog-add-new";
import FormSearch from "./form-search";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";
import { useState } from "react";

const AppLogo = () => {
	return (
		<Link href="/">
			<h1 className="font-extrabold text-2xl bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
				{aliasName}
			</h1>
		</Link>
	);
};

const AppHeader = () => {
	const [open, setOpen] = useState(false);

	const searchParams = useSearchParams();
	const pathName = usePathname();

	const objectSearch = Object.fromEntries(searchParams.entries() || []) || {};

	return (
		<header className="sticky py-5 px-4 border-muted border-b top-0 left-0 w-full bg-white z-10 self-start">
			<div className="container w-full mx-auto flex items-center justify-between">
				<AppLogo />
				{pathName.startsWith("/search") && (
					<div className="max-w-3/5 w-full md:block hidden">
						<FormSearch isHeader searchParams={objectSearch} />
					</div>
				)}
				<div className="md:flex gap-3 hidden">
					<DialogAddNewImage />
				</div>
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger asChild>
						<button className="md:hidden block">
							<Menu className="text-neutral-500" />
						</button>
					</SheetTrigger>
					<SheetContent side="right" className="w-3/4 max-w-sm">
						<SheetHeader>
							<SheetTitle
								onClick={() => {
									setOpen(false);
								}}
							>
								<AppLogo />
							</SheetTitle>
							<SheetDescription />
						</SheetHeader>
						<div className="grid auto-rows-min gap-4 mt-4">
							{pathName.startsWith("/search") && (
								<div className="w-full px-2">
									<FormSearch isHeader searchParams={objectSearch} />
								</div>
							)}
							<div className="px-4 mx-auto">
								<DialogAddNewImage />
							</div>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
};

export default AppHeader;
