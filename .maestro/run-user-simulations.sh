#!/bin/bash

# Sentry Data Generation Script
# This script runs Maestro flows to generate realistic user behavior data for Sentry

echo "🚀 Starting Sentry Data Generation"
echo "=================================="

# Set environment variables for the deployed backend
export EXPO_PUBLIC_API_BASE_URL="https://skipline-backend.onrender.com"

# Function to run a test with error handling
run_test() {
    local test_name="$1"
    local test_file="$2"
    
    echo ""
    echo "📱 Running: $test_name"
    echo "   File: $test_file"
    echo "   Time: $(date)"
    
    if maestro test "$test_file"; then
        echo "   ✅ SUCCESS: $test_name completed"
    else
        echo "   ❌ FAILED: $test_name failed"
        return 1
    fi
}

# Run the comprehensive user simulation with product interactions
echo ""
echo "🛒 Running Comprehensive User Simulation (3 iterations)"
run_test "Comprehensive User Simulation" ".maestro/user-behaviors/comprehensive-user-simulation.yml"

# Run error simulation to test error handling and generate error data
echo ""
echo "⚠️  Running Error Simulation (2 iterations)"
run_test "Error Simulation" ".maestro/user-behaviors/error-simulation.yml"

echo ""
echo "📊 Summary"
echo "=========="
echo "✅ Sentry data generation completed!"
echo "📈 Generated data includes:"
echo "   - Performance metrics (app launch, navigation, scrolling)"
echo "   - User interaction traces (taps, swipes)"
echo "   - Navigation events (cart interactions, screen transitions)"
echo "   - Session data (app usage patterns)"
echo "   - Error tracking (if any issues occur)"

echo ""
echo "🔍 Next Steps:"
echo "   - Check Sentry dashboard for new data"
echo "   - Monitor performance metrics and user flows"
echo "   - Review navigation traces and user interactions"
echo "   - Analyze any errors or performance issues"

echo ""
echo "✨ Sentry data generation complete!"
