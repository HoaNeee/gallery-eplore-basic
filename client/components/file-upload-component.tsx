"use client";

import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemPreview,
	FileUploadList,
	FileUploadTrigger,
} from "@/components/ui/file-upload";

export function FileUploadComponent({
	files,
	setFiles,
}: {
	files: File[];
	setFiles: (files: File[]) => void;
}) {
	const onFileReject = React.useCallback((file: File, message: string) => {
		toast(message, {
			description: `"${
				file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
			}" has been rejected`,
		});
	}, []);

	return (
		<FileUpload
			maxFiles={2}
			maxSize={5 * 1024 * 1024}
			className="w-full max-w-md"
			value={files}
			onValueChange={(files) => {
				setFiles(files);
			}}
			onFileReject={onFileReject}
			multiple
		>
			<FileUploadDropzone>
				<div className="flex flex-col items-center gap-1 text-center">
					<div className="flex items-center justify-center rounded-full border p-2.5">
						<Upload className="size-6 text-muted-foreground" />
					</div>
					<p className="font-medium text-sm">Drag & drop files here</p>
					<p className="text-muted-foreground text-xs">
						Or click to browse (max 2 files, up to 5MB each)
					</p>
				</div>
				<FileUploadTrigger asChild>
					<Button variant="outline" size="sm" className="mt-2 w-fit">
						Browse files
					</Button>
				</FileUploadTrigger>
			</FileUploadDropzone>
			<FileUploadList orientation="horizontal">
				{files.map((file, index) => (
					<FileUploadItem key={index} value={file} className="p-0">
						<FileUploadItemPreview className="size-20"></FileUploadItemPreview>
						<FileUploadItemDelete asChild>
							<Button
								variant="secondary"
								size="icon"
								className="-top-1 -right-1 absolute size-5 rounded-full"
							>
								<X className="size-3" />
							</Button>
						</FileUploadItemDelete>
					</FileUploadItem>
				))}
			</FileUploadList>
		</FileUpload>
	);
}
