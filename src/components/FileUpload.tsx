import { useRef, useCallback } from "react";
import "./FileUpload.css";

interface FileUploadProps {
	isDragging: boolean;
	setIsDragging: (isDragging: boolean) => void;
	onFileSelect: (file: File) => void;
}

export function FileUpload({
	isDragging,
	setIsDragging,
	onFileSelect,
}: FileUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				onFileSelect(file);
			}
		},
		[onFileSelect],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const file = e.dataTransfer.files?.[0];
			if (file && file.name.endsWith(".db")) {
				onFileSelect(file);
			}
		},
		[onFileSelect, setIsDragging],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(true);
		},
		[setIsDragging],
	);

	const handleDragLeave = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
		},
		[setIsDragging],
	);

	const handleUploadClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	return (
		<button
			type="button"
			className={`upload-area ${isDragging ? "dragging" : ""}`}
			onDrop={handleDrop}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onClick={handleUploadClick}
		>
			<div className="upload-content">
				<svg
					className="upload-icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" y1="3" x2="12" y2="15" />
				</svg>
				<p className="upload-text">
					<strong>Click to upload</strong> or drag and drop
				</p>
				<p className="upload-hint">transfers.db file</p>
				<input
					ref={fileInputRef}
					type="file"
					accept=".db"
					onChange={handleFileChange}
					className="file-input"
				/>
			</div>
		</button>
	);
}
