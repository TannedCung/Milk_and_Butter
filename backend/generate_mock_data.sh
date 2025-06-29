#!/bin/bash

echo "===================================================="
echo "🐾 MilkandButter Mock Data Generator"
echo "===================================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: backend directory containing manage.py"
    exit 1
fi

echo "📋 Checking Django environment..."
if ! python manage.py check --deploy >/dev/null 2>&1; then
    echo "❌ Django environment check failed"
    echo "   Please ensure Django is properly configured"
    exit 1
fi

echo "✅ Django environment OK"
echo ""

# Prompt for user ID
read -p "Enter User ID to assign pets to (default: 1): " USER_ID
USER_ID=${USER_ID:-1}

echo "🚀 Starting mock data generation for User ID: $USER_ID"
echo ""

# Run the management command
if python manage.py generate_mock_data --user-id "$USER_ID"; then
    echo ""
    echo "🎉 Mock data generation completed successfully!"
else
    echo ""
    echo "❌ Mock data generation failed!"
    echo "   Check the error messages above for details"
    exit 1
fi

echo ""
echo "✨ You can now test the application with comprehensive pet health data!" 