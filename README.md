# slsk-demo

1. Copy transfers.db from slskd instance
```bash
# Example local system
cp /idk/the/path ./transfers.db

# Example remote container
scp 10.0.0.20:/containers/slskd/data/transfers.db ./transfers.db
```

2. Run script
```bash
uv venv
source .venv/scripts/activate
uv run main.py
```
