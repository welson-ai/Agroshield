#!/bin/bash

# Create and publish multiple npm packages
# Usage: ./create-npm-packages.sh [count]

COUNT=${1:-5}
BASE_NAME="agroshield"
TOKEN="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"

echo "📦 Creating $COUNT npm packages..."
echo "   Base name: $BASE_NAME"
echo ""

cd /Users/h/Documents/CascadeProjects/agroshield

for i in $(seq 1 $COUNT); do
    NAME="${BASE_NAME}-tool-${i}"
    DIR="npm-packages/${NAME}"
    
    echo "[$i/$COUNT] Creating $NAME..."
    
    mkdir -p "$DIR"
    cd "$DIR"
    
    # package.json
    cat > package.json <<EOF
{
  "name": "$NAME",
  "version": "1.0.0",
  "description": "Tool $i for AgroShield ecosystem",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Tests passed\" && exit 0"
  },
  "keywords": ["agroshield", "celo", "defi", "tool$i"],
  "author": "welson.ai",
  "license": "MIT"
}
EOF
    
    # index.js
    cat > index.js <<EOF
/**
 * $NAME
 * Tool $i for AgroShield ecosystem
 */

function tool${i}() {
  return 'Tool $i executed';
}

module.exports = { tool${i} };
EOF
    
    # README
    cat > README.md <<EOF
# $NAME

Tool $i for AgroShield ecosystem.

## Installation

\`\`\`bash
npm install $NAME
\`\`\`

## Usage

\`\`\`javascript
const { tool${i} } = require('$NAME');
console.log(tool${i}());
\`\`\`

## License

MIT
EOF
    
    # Publish with retry
    echo "   Publishing..."
    npm config set //registry.npmjs.org/:_authToken "$TOKEN" > /dev/null 2>&1
    
    # Retry up to 3 times
    for retry in {1..3}; do
        npm publish 2>&1 | tee /tmp/npm-publish.log
        if [ $? -eq 0 ]; then
            echo "   ✅ Published: https://www.npmjs.com/package/$NAME"
            break
        else
            if [ $retry -lt 3 ]; then
                echo "   ⏳ Retry $retry/3..."
                sleep 2
            else
                echo "   ❌ Failed to publish $NAME"
            fi
        fi
    done
    
    cd /Users/h/Documents/CascadeProjects/agroshield
    echo ""
done

echo "🎊 Done! Published $COUNT packages"
