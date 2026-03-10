import { useState, useCallback } from 'react';
import initSqlJs from 'sql.js';
import type {
  AnalysisResult,
  TopUserByFiles,
  TopUserBySize,
  UserStats,
  TransferStates,
  FileExtension
} from '../types';

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
  LIMIT 100
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
  LIMIT 100
`;

const TOP_UPLOADERS_FILES_QUERY = `
  SELECT 
    Username,
    COUNT(*) as file_count
  FROM Transfers
  WHERE Direction = 'Upload'
    AND State = 48
    AND Username IS NOT NULL
  GROUP BY Username
  ORDER BY file_count DESC
  LIMIT 100
`;

const TOP_UPLOADERS_SIZE_QUERY = `
  SELECT 
    Username,
    COALESCE(SUM(Size), 0) as total_bytes,
    COUNT(*) as file_count
  FROM Transfers
  WHERE Direction = 'Upload'
    AND State = 48
    AND Username IS NOT NULL
  GROUP BY Username
  ORDER BY total_bytes DESC
  LIMIT 100
`;

const ALL_USERS_QUERY = `
  SELECT 
    Username,
    COALESCE(SUM(CASE WHEN Direction = 'Download' AND State = 48 THEN 1 ELSE 0 END), 0) as dl_files,
    COALESCE(SUM(CASE WHEN Direction = 'Download' AND State = 48 THEN Size ELSE 0 END), 0) as dl_bytes,
    COALESCE(SUM(CASE WHEN Direction = 'Upload' AND State = 48 THEN 1 ELSE 0 END), 0) as ul_files,
    COALESCE(SUM(CASE WHEN Direction = 'Upload' AND State = 48 THEN Size ELSE 0 END), 0) as ul_bytes
  FROM Transfers
  WHERE Username IS NOT NULL
  GROUP BY Username
  HAVING dl_files > 0 OR ul_files > 0
  ORDER BY dl_bytes DESC
`;

const TRANSFER_STATES_QUERY = `
  SELECT 
    Direction,
    State,
    COUNT(*)
  FROM Transfers
  WHERE Username IS NOT NULL
  GROUP BY Direction, State
`;

const FILE_EXTENSIONS_QUERY = `
  SELECT 
    CASE 
      WHEN Filename LIKE '%.%' THEN SUBSTR(Filename, LENGTH(Filename) - INSTR(REVERSE(Filename), '.') + 2)
      ELSE 'no_extension'
    END as extension,
    COUNT(*) as count,
    COALESCE(SUM(Size), 0) as total_bytes
  FROM Transfers
  WHERE Direction = 'Download' AND State = 48 AND Filename IS NOT NULL
  GROUP BY extension
  ORDER BY count DESC
  LIMIT 6
`;

const AVG_FILE_SIZE_QUERY = `
  SELECT 
    COALESCE(AVG(Size), 0),
    COUNT(DISTINCT Filename)
  FROM Transfers
  WHERE Direction = 'Download' AND State = 48
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

      // Basic stats
      const dlResult = db.exec(DOWNLOAD_QUERY);
      const dlData = dlResult[0]?.values[0] || [0, 0, 0, 0];

      const ulResult = db.exec(UPLOAD_QUERY);
      const ulData = ulResult[0]?.values[0] || [0, 0, 0, 0];

      // Top downloaders
      const topFilesResult = db.exec(TOP_FILES_QUERY);
      const topByFiles: TopUserByFiles[] = (
        topFilesResult[0]?.values || []
      ).map((row) => ({
        username: row[0] as string,
        fileCount: row[1] as number
      }));

      const topSizeResult = db.exec(TOP_SIZE_QUERY);
      const topBySize: TopUserBySize[] = (topSizeResult[0]?.values || []).map(
        (row) => ({
          username: row[0] as string,
          totalBytes: row[1] as number,
          fileCount: row[2] as number
        })
      );

      // Top uploaders
      const topUploadersFilesResult = db.exec(TOP_UPLOADERS_FILES_QUERY);
      const topUploadersByFiles: TopUserByFiles[] = (
        topUploadersFilesResult[0]?.values || []
      ).map((row) => ({
        username: row[0] as string,
        fileCount: row[1] as number
      }));

      const topUploadersSizeResult = db.exec(TOP_UPLOADERS_SIZE_QUERY);
      const topUploadersBySize: TopUserBySize[] = (
        topUploadersSizeResult[0]?.values || []
      ).map((row) => ({
        username: row[0] as string,
        totalBytes: row[1] as number,
        fileCount: row[2] as number
      }));

      // All users with stats
      const allUsersResult = db.exec(ALL_USERS_QUERY);
      const allUsers: UserStats[] = (allUsersResult[0]?.values || []).map(
        (row) => {
          const dlBytes = Number(row[2]);
          const ulBytes = Number(row[4]);
          return {
            username: row[0] as string,
            downloadFiles: Number(row[1]),
            downloadBytes: dlBytes,
            uploadFiles: Number(row[3]),
            uploadBytes: ulBytes,
            ratio: dlBytes > 0 ? ulBytes / dlBytes : null
          };
        }
      );

      // Transfer states
      const statesResult = db.exec(TRANSFER_STATES_QUERY);
      const transferStates: TransferStates = {
        completed: { downloads: 0, uploads: 0 },
        failed: { downloads: 0, uploads: 0 },
        cancelled: { downloads: 0, uploads: 0 },
        inProgress: { downloads: 0, uploads: 0 }
      };
      (statesResult[0]?.values || []).forEach((row) => {
        const direction = row[0] as string;
        const state = Number(row[1]);
        const count = Number(row[2]);
        const dir = direction === 'Download' ? 'downloads' : 'uploads';

        // State 48 = Completed, others vary by implementation
        if (state === 48) {
          transferStates.completed[dir] += count;
        } else if (state === 16 || state === 32) {
          // Cancelled or Aborted
          transferStates.cancelled[dir] += count;
        } else if (state === 64 || state === 128) {
          // Failed or Errored
          transferStates.failed[dir] += count;
        } else {
          transferStates.inProgress[dir] += count;
        }
      });

      // File extensions
      const extensionsResult = db.exec(FILE_EXTENSIONS_QUERY);
      const topExtensions: FileExtension[] = (
        extensionsResult[0]?.values || []
      ).map((row) => ({
        extension: row[0] as string,
        count: Number(row[1]),
        totalBytes: Number(row[2])
      }));

      // Average file size
      const avgResult = db.exec(AVG_FILE_SIZE_QUERY);
      const avgData = avgResult[0]?.values[0] || [0, 0];

      db.close();

      const dlSize = Number(dlData[1]);
      const ulSize = Number(ulData[1]);

      setResult({
        global: {
          downloads: {
            count: Number(dlData[0]),
            size: dlSize,
            transferred: Number(dlData[2]),
            users: Number(dlData[3])
          },
          uploads: {
            count: Number(ulData[0]),
            size: ulSize,
            transferred: Number(ulData[2]),
            users: Number(ulData[3])
          },
          ratio: dlSize > 0 ? ulSize / dlSize : null
        },
        topByFiles,
        topBySize,
        topUploadersByFiles,
        topUploadersBySize,
        allUsers,
        transferStates,
        topExtensions,
        averageFileSize: Number(avgData[0]),
        uniqueFiles: Number(avgData[1])
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to analyze database'
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
    reset
  };
}
