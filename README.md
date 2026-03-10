# slskd-stats

A web application to analyze Soulseek (slskd) transfer statistics from your `transfers.db` file, entirely in the browser.

## Features

- **Privacy-first**: Your database file is analyzed locally in your browser - no data is ever uploaded to any server
- **Drag & drop**: Simply drag your `transfers.db` file into the app or click to upload
- **Comprehensive stats**:
  - Global download/upload statistics
  - Transfer sizes and data transferred
  - Unique user counts
  - Top users by files downloaded
  - Top users by data downloaded
  - Upload/download ratio

## Usage

### Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Build

```bash
pnpm build
```

The built files will be in the `dist/` directory.

### Analyzing Your Data

1. Locate your `transfers.db` file from your slskd instance
2. Open the app (either running locally or the built version)
3. Drag and drop your `transfers.db` file, or click to select it
4. View your statistics!

## How It Works

This app uses [sql.js](https://sql.js.org/) - a JavaScript/WebAssembly implementation of SQLite - to read and query your database file entirely within your browser. Your file never leaves your computer.

## Credits

- Built with [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- SQLite functionality by [sql.js](https://sql.js.org/)
