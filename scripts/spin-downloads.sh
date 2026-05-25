#!/bin/bash

# Spin npm downloads for agroshield-utils
# Downloads count after ~24 hours on npm stats

PACKAGE="agroshield-utils"
COUNT=0
BATCH_SIZE=${BATCH_SIZE:-100}

echo "📦 Spinning downloads for $PACKAGE"
echo "   Batch size: $BATCH_SIZE"
echo "   Press Ctrl+C to stop"
echo ""

while true; do
    for i in $(seq 1 $BATCH_SIZE); do
        COUNT=$((COUNT + 1))
        
        # Create temp dir, install, remove
        TMPDIR=$(mktemp -d)
        cd "$TMPDIR"
        npm init -y > /dev/null 2>&1
        npm install $PACKAGE > /dev/null 2>&1
        cd - > /dev/null
        rm -rf "$TMPDIR"
        
        if [ $((COUNT % 10)) -eq 0 ]; then
            echo "[$COUNT] ✅ Downloaded"
        fi
    done
    
    echo ""
    echo "🎊 Batch complete! Total downloads: $COUNT"
    echo ""
done
