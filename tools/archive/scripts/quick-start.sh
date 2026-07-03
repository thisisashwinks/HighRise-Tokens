#!/bin/bash
# Quick Start Script for Figma Token Plugin Setup

set -e

echo "🚀 HighRise Tokens - Figma Plugin Quick Start"
echo "=============================================="
echo ""

# Step 1: Generate mappings
echo "📦 Step 1: Generating mapping files for all components..."
python3 scripts/batch-generate-mappings.py

if [ $? -ne 0 ]; then
    echo "❌ Error generating mappings"
    exit 1
fi

echo ""
echo "✅ Mappings generated successfully!"
echo ""

# Step 2: Build plugin
echo "🔨 Step 2: Building Figma plugin..."
cd figma-plugin-apply-tokens

if [ ! -d "node_modules" ]; then
    echo "📥 Installing plugin dependencies..."
    npm install
fi

echo "🔨 Compiling plugin..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error building plugin"
    exit 1
fi

cd ..

echo ""
echo "✅ Plugin built successfully!"
echo ""
echo "=============================================="
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Open Figma Desktop App"
echo "2. Go to: Plugins → Development → Import plugin from manifest..."
echo "3. Navigate to: figma-plugin-apply-tokens/"
echo "4. Select: manifest.json"
echo "5. Plugin will appear in: Plugins → Development → Apply Component Tokens"
echo ""
echo "See figma-plugin-apply-tokens/SETUP_GUIDE.md for detailed instructions"
echo ""

