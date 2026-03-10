import { useState } from "react";
import { useDatabaseAnalysis } from "./hooks/useDatabaseAnalysis";
import {
	Header,
	Footer,
	FileUpload,
	Loading,
	ErrorMessage,
	Results,
} from "./components";
import "./App.css";

export default function App() {
	const [isDragging, setIsDragging] = useState(false);
	const { isLoading, error, result, fileName, analyzeDatabase, reset } =
		useDatabaseAnalysis();

	const handleFileSelect = (file: File) => {
		analyzeDatabase(file);
	};

	const handleRetry = () => {
		reset();
	};

	const handleAnalyzeAnother = () => {
		reset();
	};

	return (
		<div className="app">
			<Header />

			<main className="main">
				{!result && !isLoading && (
					<FileUpload
						isDragging={isDragging}
						setIsDragging={setIsDragging}
						onFileSelect={handleFileSelect}
					/>
				)}

				{isLoading && <Loading />}

				{error && <ErrorMessage message={error} onRetry={handleRetry} />}

				{result && (
					<Results
						result={result}
						fileName={fileName}
						onAnalyzeAnother={handleAnalyzeAnother}
					/>
				)}
			</main>

			<Footer />
		</div>
	);
}
