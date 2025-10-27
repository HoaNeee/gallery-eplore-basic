import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

const ButtonTransition = ({
	className,
	children,
	loading,
	...props
}: React.ComponentProps<"button"> & { loading?: boolean }) => {
	return (
		<button
			className={cn(
				"inline-flex relative items-center cursor-pointer dark:text-neutral-800/80 justify-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white not-disabled:bg-linear-to-r from-primary to-primary/80 not-disabled:hover:from-primary/90 not-disabled:hover:to-primary/70 transition-all duration-200 shadow-lg not-disabled:hover:shadow-xl transform not-disabled:hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary/80",
				className
			)}
			disabled={loading}
			{...props}
		>
			<div
				className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center"
				style={{
					opacity: loading ? 1 : 0,
				}}
			>
				loading...
			</div>
			<p
				style={{
					opacity: loading ? 0 : 1,
				}}
			>
				{children}
			</p>
		</button>
	);
};

const ButtonLoading = ({
	children,
	loading,
	onClick,
	disabled,
	className,
	type,
	title,
}: {
	children: React.ReactNode;
	loading?: boolean;
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
	type?: "button" | "submit" | "reset";
	title?: string;
}) => {
	return (
		<Button
			className={cn("relative transition-all duration-300", className)}
			onClick={onClick}
			disabled={disabled || loading}
			type={type || "submit"}
			title={title}
		>
			<div
				className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center"
				style={{
					opacity: loading ? 1 : 0,
				}}
			>
				loading...
			</div>
			<p
				style={{
					opacity: loading ? 0 : 1,
				}}
			>
				{children}
			</p>
		</Button>
	);
};

export { Button, buttonVariants, ButtonTransition, ButtonLoading };
