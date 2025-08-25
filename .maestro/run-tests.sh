#!/bin/bash
# Run e2e tests on both iOS and Android

echo "🧪 Running Skipline E2E Tests"
echo "=============================="

# Function to run test and check result
run_test() {
    local platform=$1
    local test_file=$2
    
    echo ""
    echo "📱 Running $test_file on $platform..."
    
    if maestro test $test_file; then
        echo "✅ $test_file passed on $platform"
        return 0
    else
        echo "❌ $test_file failed on $platform"
        return 1
    fi
}

# Track overall success
all_passed=true

# Run on iOS if simulator is available
if xcrun simctl list devices | grep -q "Booted"; then
    echo "🍎 iOS Simulator detected"
    
    for test in checkout-flow.yml add-to-cart.yml stress-test.yml; do
        if ! run_test "iOS" ".maestro/$test"; then
            all_passed=false
        fi
    done
else
    echo "⚠️  No iOS Simulator running"
fi

# Run on Android if emulator is available
if adb devices | grep -q "emulator"; then
    echo ""
    echo "🤖 Android Emulator detected"
    
    for test in checkout-flow.yml add-to-cart.yml stress-test.yml; do
        if ! run_test "Android" ".maestro/$test"; then
            all_passed=false
        fi
    done
else
    echo "⚠️  No Android Emulator running"
fi

# Summary
echo ""
echo "=============================="
if $all_passed; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
