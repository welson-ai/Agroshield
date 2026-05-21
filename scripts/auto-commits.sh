#!/bin/bash

# Continuous commits - loops forever
# Each batch = 100 commits, then push and repeat

cd /Users/h/Documents/CascadeProjects/agroshield

# Set git config
git config user.name "welson.ai"
git config user.email "metanexus8@gmail.com"

BATCH_SIZE=${BATCH_SIZE:-100}
INTERVAL=${INTERVAL:-30}
TOTAL_COMMITS=0
BATCH_NUM=0

echo "🚀 Starting continuous commit loop..."
echo "   Batch size: $BATCH_SIZE"
echo "   Interval: ${INTERVAL}s"
echo "   Press Ctrl+C to stop"
echo ""

while true; do
    BATCH_NUM=$((BATCH_NUM + 1))
    echo "📦 Starting Batch #$BATCH_NUM..."
    
    for i in $(seq 1 $BATCH_SIZE); do
        TOTAL_COMMITS=$((TOTAL_COMMITS + 1))
        
        # Create/update a file with timestamp
        echo "// AgroShield Update #$TOTAL_COMMITS - $(date '+%Y-%m-%d %H:%M:%S')" >> docs/changelog.md
        echo "- Improvement $TOTAL_COMMITS: Enhanced system stability and performance" >> docs/changelog.md
        echo "" >> docs/changelog.md
        
        git add .
        git commit -m "feat: improvement #$TOTAL_COMMITS - system enhancement $(date '+%H:%M:%S')"
        
        echo "✅ Commit $i/$BATCH_SIZE (Total: $TOTAL_COMMITS)"
        
        sleep $INTERVAL
    done
    
    echo ""
    echo "📤 Pushing Batch #$BATCH_NUM to GitHub..."
    git push origin main
    echo "🎊 Batch #$BATCH_NUM complete! Total commits: $TOTAL_COMMITS"
    echo ""
done
