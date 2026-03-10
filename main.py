#!/usr/bin/env python3
"""
Demo script to read slskd transfers.db and output download statistics.
"""

import sqlite3
from pathlib import Path


def main():
    db_path = Path("./transfers.db")

    if not db_path.exists():
        print(f"Database not found: {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Global stats
    print("=" * 60)
    print("Global Statistics")
    print("=" * 60)

    # Downloads
    cursor.execute("""
        SELECT 
            COUNT(*),
            SUM(Size),
            SUM(BytesTransferred),
            COUNT(DISTINCT Username)
        FROM Transfers
        WHERE Direction = 'Download'
          AND State = 48
          AND Username IS NOT NULL
    """)
    dl_count, dl_size, dl_transferred, dl_users = cursor.fetchone()
    dl_count = dl_count or 0
    dl_size = dl_size or 0
    dl_transferred = dl_transferred or 0
    dl_users = dl_users or 0

    # Uploads
    cursor.execute("""
        SELECT 
            COUNT(*),
            SUM(Size),
            SUM(BytesTransferred),
            COUNT(DISTINCT Username)
        FROM Transfers
        WHERE Direction = 'Upload'
          AND State = 48
          AND Username IS NOT NULL
    """)
    ul_count, ul_size, ul_transferred, ul_users = cursor.fetchone()
    ul_count = ul_count or 0
    ul_size = ul_size or 0
    ul_transferred = ul_transferred or 0
    ul_users = ul_users or 0

    def fmt_bytes(b):
        if b >= 1024**4:
            return f"{b / (1024**4):.2f} TB"
        elif b >= 1024**3:
            return f"{b / (1024**3):.2f} GB"
        elif b >= 1024**2:
            return f"{b / (1024**2):.2f} MB"
        else:
            return f"{b / 1024:.2f} KB"

    print(f"Downloads:")
    print(f"  Files:      {dl_count:,}")
    print(f"  Size:       {fmt_bytes(dl_size)}")
    print(f"  Transferred:{fmt_bytes(dl_transferred)}")
    print(f"  Unique users:{dl_users:,}")
    if dl_count > 0:
        print(f"  Avg size:   {fmt_bytes(dl_size / dl_count)}")

    print()
    print(f"Uploads:")
    print(f"  Files:      {ul_count:,}")
    print(f"  Size:       {fmt_bytes(ul_size)}")
    print(f"  Transferred:{fmt_bytes(ul_transferred)}")
    print(f"  Unique users:{ul_users:,}")
    if ul_count > 0:
        print(f"  Avg size:   {fmt_bytes(ul_size / ul_count)}")

    print()
    print(f"Ratio (Up/Down): {ul_size / dl_size:.2f}x" if dl_size > 0 else "Ratio: N/A")
    print()

    # Top 10 users by number of files downloaded
    print("=" * 60)
    print("Top 10 Users by Number of Files Downloaded")
    print("=" * 60)

    cursor.execute("""
        SELECT 
            Username,
            COUNT(*) as file_count
        FROM Transfers
        WHERE Direction = 'Download'
          AND State = 48  -- Completed, Succeeded
          AND Username IS NOT NULL
        GROUP BY Username
        ORDER BY file_count DESC
        LIMIT 10
    """)

    for rank, (username, count) in enumerate(cursor.fetchall(), 1):
        print(f"{rank:2}. {username:<30} {count:>6} files")

    print()

    # Top 10 users by MB downloaded
    print("=" * 60)
    print("Top 10 Users by MB Downloaded")
    print("=" * 60)

    cursor.execute("""
        SELECT 
            Username,
            SUM(Size) as total_bytes,
            COUNT(*) as file_count
        FROM Transfers
        WHERE Direction = 'Download'
          AND State = 48  -- Completed, Succeeded
          AND Username IS NOT NULL
        GROUP BY Username
        ORDER BY total_bytes DESC
        LIMIT 10
    """)

    for rank, (username, total_bytes, file_count) in enumerate(cursor.fetchall(), 1):
        mb = total_bytes / (1024 * 1024)
        gb = total_bytes / (1024 * 1024 * 1024)
        if gb >= 1:
            size_str = f"{gb:>8.2f} GB"
        else:
            size_str = f"{mb:>8.2f} MB"
        print(f"{rank:2}. {username:<30} {size_str} ({file_count} files)")

    conn.close()


if __name__ == "__main__":
    main()
