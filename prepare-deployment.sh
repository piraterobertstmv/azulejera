#!/bin/bash

# Cursor Business Manager - Deployment Preparation Script
# This script prepares your application for Plesk deployment

echo "🚀 Preparing Cursor Business Manager for Plesk Deployment"
echo "=========================================================="
echo ""

# Set deployment package name
PACKAGE_NAME="cursor-app-$(date +%Y%m%d-%H%M%S).zip"

echo "📦 Creating deployment package: $PACKAGE_NAME"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the app root directory."
    exit 1
fi

echo "✅ Found package.json"
echo ""

# Create deployment package
echo "📁 Packaging files (excluding development files)..."
zip -r "$PACKAGE_NAME" . \
    -x "node_modules/*" \
    -x ".next/*" \
    -x ".next/**/*" \
    -x "prisma/dev.db*" \
    -x ".env" \
    -x ".env.*" \
    -x "*.log" \
    -x "*.log.*" \
    -x "tsconfig.tsbuildinfo" \
    -x ".git/*" \
    -x ".git/**/*" \
    -x "*.zip" \
    -x ".DS_Store" \
    -x "coverage/*" \
    -x ".nyc_output/*" \
    -x "*.swp" \
    -x "*.swo" \
    -x ".vscode/*" \
    -x ".idea/*"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment package created successfully!"
    echo ""
    echo "📊 Package Details:"
    ls -lh "$PACKAGE_NAME"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Upload '$PACKAGE_NAME' to your Plesk server"
    echo "2. Extract in /var/www/vhosts/yourdomain.com/httpdocs/"
    echo "3. Follow instructions in DEPLOYMENT_PLESK.md"
    echo ""
    echo "📖 Documentation:"
    echo "   - Full Guide: DEPLOYMENT_PLESK.md"
    echo "   - Checklist: DEPLOYMENT_CHECKLIST.md"
    echo ""
    echo "🎉 Ready for deployment!"
else
    echo ""
    echo "❌ Error creating deployment package"
    exit 1
fi

