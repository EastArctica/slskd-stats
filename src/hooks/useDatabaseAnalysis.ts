import { useState, useCallback } from "react";
import initSqlJs from "sql.js";
import type { AnalysisResult, TopUserByFiles, TopUserBySize } from "../types";

interface UseDatabaseAnalysisReturn {
	isLoading: boolean;
	error: string | null;
	result: AnalysisResult | null;
	fileName: string | null;
	analyzeDatabase: (file: File) => Promise<void>;
	reset: () => void;
}

const DOWNLOAD_QUERY = `
  SELECT 
    COUNT(*),
    COALESCE(SUM(Size), 0),
    COALESCE(SUM(BytesTransferred), 0),
    COUNT(DISTINCT Username)
  FROM Transfers
  WHERE Direction = 'Download'
    AND State = 48
    AND Username IS NOT NULL
`;

const UPLOAD_QUERY = `
  SELECT 
    COUNT(*),
    COALESCE(SUM(Size), 0),
    COALESCE(SUM(BytesTransferred), 0),
    COUNT(DISTINCT Username)
  FROM Transfers
  WHERE Direction = 'Upload'
    AND State = 48
    AND Username IS NOT NULL
`;

const TOP_FILES_QUERY = `
  SELECT 
    Username,
    COUNT(*) as file_count
  FROM Transfers
  WHERE Direction = 'Download'
    AND State = 48
    AND Username IS NOT NULL
  GROUP BY Username
  ORDER BY file_count DESC
  LIMIT 10
`;

const TOP_SIZE_QUERY = `
  SELECT 
    Username,
    COALESCE(SUM(Size), 0) as total_bytes,
    COUNT(*) as file_count
  FROM Transfers
  WHERE Direction = 'Download'
    AND State = 48
    AND Username IS NOT NULL
  GROUP BY Username
  ORDER BY total_bytes DESC
  LIMIT 10
`;

export function useDatabaseAnalysis(): UseDatabaseAnalysisReturn {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);

	const analyzeDatabase = useCallback(async (file: File) => {
		setIsLoading(true);
		setError(null);
		setFileName(file.name);

		try {
			const SQL = await initSqlJs({});

			const arrayBuffer = await file.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);
			const db = new SQL.Database(uint8Array);

			const dlResult = db.exec(DOWNLOAD_QUERY);
			const dlData = dlResult[0]?.values[0] || [0, 0, 0, 0];

			const ulResult = db.exec(UPLOAD_QUERY);
			const ulData = ulResult[0]?.values[0] || [0, 0, 0, 0];

			const topFilesResult = db.exec(TOP_FILES_QUERY);
			const topByFiles: TopUserByFiles[] = (topFilesResult[0]?.values || []).map(
				(row) => ({
					username: row[0] as string,
					fileCount: row[1] as number,
				}),
			);

			const topSizeResult = db.exec(TOP_SIZE_QUERY);
			const topBySize: TopUserBySize[] = (topSizeResult[0]?.values || []).map(
				(row) => ({
					username: row[0] as string,
					totalBytes: row[1] as number,
					fileCount: row[2] as number,
				}),
			);

			db.close();

			const dlSize = Number(dlData[1]);
			const ulSize = Number(ulData[1]);

			setResult({
				global: {
					downloads: {
						count: Number(dlData[0]),
						size: dlSize,
						transferred: Number(dlData[2]),
						users: Number(dlData[3]),
					},
					uploads: {
						count: Number(ulData[0]),
						size: ulSize,
						transferred: Number(ulData[2]),
						users: Number(ulData[3]),
					},
					ratio: dlSize > 0 ? ulSize / dlSize : null,
				},
				topByFiles,
				topBySize,
			});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to analyze database",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const reset = useCallback(() => {
		setError(null);
		setResult(null);
		setFileName(null);
	}, []);

	return {
		isLoading,
		error,
		result,
		fileName,
		analyzeDatabase,
		reset,
	};
}
