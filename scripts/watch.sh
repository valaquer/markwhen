#!/bin/bash
# Watches honeybloom.mw for changes, re-renders, and refreshes Safari tab.
# Usage: bash scripts/watch.sh

FORK_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MW_FILE="$FORK_DIR/sample-data/honeybloom.mw"
OUTPUT="$FORK_DIR/markwhen-fork.html"
LAST_HASH=""

echo "Watching $MW_FILE for changes..."

while true; do
    CURRENT_HASH=$(md5 -q "$MW_FILE" 2>/dev/null)
    if [ "$CURRENT_HASH" != "$LAST_HASH" ] && [ -n "$LAST_HASH" ]; then
        echo "$(date '+%H:%M:%S') Change detected — re-rendering..."
        /opt/homebrew/bin/node "$FORK_DIR/scripts/render.mjs" "$MW_FILE" "$OUTPUT"
        osascript -e 'tell application "Safari"
            set targetURL to "markwhen-fork.html"
            repeat with w in windows
                repeat with t in tabs of w
                    if URL of t contains targetURL then
                        set URL of t to URL of t
                        return
                    end if
                end repeat
            end repeat
        end tell' 2>/dev/null
        echo "$(date '+%H:%M:%S') Refreshed."
    fi
    LAST_HASH="$CURRENT_HASH"
    sleep 1
done
