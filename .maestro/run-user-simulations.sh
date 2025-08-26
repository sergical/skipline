#!/bin/bash
# Run user behavior simulations to populate Sentry data

echo "🎭 Skipline User Behavior Simulator"
echo "=================================="

# Function to show usage
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  single <behavior>   Run a single behavior flow"
    echo "  continuous [count]  Run continuous simulation (default: 10 iterations)"
    echo "  stress             Run stress test with heavy load"
    echo "  all                Run all behaviors once"
    echo ""
    echo "Behaviors:"
    echo "  - happy-path-purchase"
    echo "  - browse-only"
    echo "  - cart-abandonment"
    echo "  - quick-purchase"
    echo "  - price-conscious-shopper"
    echo "  - power-user"
    echo ""
    echo "Examples:"
    echo "  $0 single happy-path-purchase"
    echo "  $0 continuous 20"
    echo "  $0 stress"
}

# Check if maestro is installed
if ! command -v maestro &> /dev/null; then
    echo "❌ Maestro is not installed. Please install it first."
    exit 1
fi

# Parse command
case "$1" in
    single)
        if [ -z "$2" ]; then
            echo "❌ Please specify a behavior to run"
            show_usage
            exit 1
        fi
        
        behavior_file=".maestro/user-behaviors/$2.yml"
        if [ ! -f "$behavior_file" ]; then
            echo "❌ Behavior file not found: $behavior_file"
            exit 1
        fi
        
        echo "🚀 Running single behavior: $2"
        maestro test "$behavior_file"
        ;;
        
    continuous)
        iterations=${2:-10}
        echo "🔄 Running continuous simulation with $iterations iterations"
        echo "   This will simulate various user behaviors to populate Sentry data"
        echo ""
        
        # Run with custom iteration count
        maestro test -e ITERATION_COUNT="$iterations" .maestro/continuous-user-simulation.yml
        ;;
        
    stress)
        echo "💪 Running stress test simulation"
        echo "   This will generate heavy load to test performance monitoring"
        echo ""
        
        # Run power user behavior multiple times in parallel
        for i in {1..3}; do
            maestro test .maestro/user-behaviors/power-user.yml &
        done
        
        # Wait for all parallel runs to complete
        wait
        
        echo "✅ Stress test completed"
        ;;
        
    all)
        echo "🎯 Running all user behaviors once"
        echo ""
        
        for behavior in happy-path-purchase browse-only cart-abandonment quick-purchase price-conscious-shopper power-user; do
            echo "▶️  Running: $behavior"
            maestro test ".maestro/user-behaviors/$behavior.yml"
            echo ""
            sleep 2
        done
        
        echo "✅ All behaviors completed"
        ;;
        
    *)
        show_usage
        exit 1
        ;;
esac

echo ""
echo "📊 Check your Sentry dashboard for:"
echo "   - Performance transactions"
echo "   - User interaction traces"
echo "   - Cart abandonment patterns"
echo "   - Error rates and patterns"
echo "   - Session replay data"
