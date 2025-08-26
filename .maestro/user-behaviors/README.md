# Skipline User Behavior Simulations

This directory contains Maestro workflows that simulate realistic user behaviors to populate Sentry with performance and error tracking data.

## 🎯 Purpose

These workflows help:
- Generate realistic performance data in Sentry
- Test app stability under various user patterns
- Identify performance bottlenecks
- Create error scenarios for debugging
- Populate session replay data

## 📁 Workflow Files

### Core User Behaviors

1. **happy-path-purchase.yml** (30% of users)
   - Complete purchase flow with coupon
   - Simulates satisfied customers
   - Generates successful transaction traces

2. **browse-only.yml** (25% of users)
   - Window shopping behavior
   - Multiple scroll actions
   - Tab navigation without purchase

3. **cart-abandonment.yml** (20% of users)
   - Adds items but doesn't complete purchase
   - Tries invalid coupon codes
   - Important for conversion tracking

4. **quick-purchase.yml** (15% of users)
   - Decisive buyer pattern
   - Minimal browsing
   - Fast checkout

5. **price-conscious-shopper.yml** (10% of users)
   - Careful price comparison
   - Always uses coupons
   - Slower, more deliberate actions

6. **power-user.yml** (5% of users)
   - Heavy app usage
   - Rapid interactions
   - Stress tests performance

7. **error-scenarios.yml** (Edge cases)
   - Network errors
   - Invalid inputs
   - Race conditions
   - App recovery testing

## 🚀 Running Simulations

### Using the Shell Script

```bash
# Make script executable
chmod +x .maestro/run-user-simulations.sh

# Run single behavior
.maestro/run-user-simulations.sh single happy-path-purchase

# Run continuous simulation (default: 10 iterations)
.maestro/run-user-simulations.sh continuous

# Run continuous with custom iterations
.maestro/run-user-simulations.sh continuous 50

# Run stress test
.maestro/run-user-simulations.sh stress

# Run all behaviors once
.maestro/run-user-simulations.sh all
```

### Direct Maestro Commands

```bash
# Run specific behavior
maestro test .maestro/user-behaviors/happy-path-purchase.yml

# Run continuous simulation
maestro test .maestro/continuous-user-simulation.yml

# Run with custom iteration count
maestro test -e ITERATION_COUNT=20 .maestro/continuous-user-simulation.yml
```

## 📊 Sentry Data Generated

### Performance Monitoring
- **Transaction Types:**
  - `navigation` - Screen transitions
  - `ui.action` - Button taps and interactions
  - `http.client` - API calls

### User Interactions
- Product browsing patterns
- Add to cart events
- Checkout flow timing
- Cart abandonment points

### Error Scenarios
- Network connectivity issues
- Invalid input handling
- Race conditions
- App state recovery

## 🔧 Customization

### Adjusting Behavior Distribution

Edit `continuous-user-simulation.yml` to change the frequency of different behaviors:

```yaml
# Adjust the random threshold to change probability
- runFlow:
    when:
      true: ${output.random = Math.random(); output.random < 0.3}  # 30% chance
    file: user-behaviors/power-user.yml
```

### Adding New Behaviors

1. Create new YAML file in `user-behaviors/`
2. Follow the naming convention: `behavior-name.yml`
3. Include appropriate tags
4. Add to `continuous-user-simulation.yml` if needed

### Modifying Wait Times

Adjust wait times to simulate different user speeds:
- Fast users: 200-500ms waits
- Average users: 1000-2000ms waits  
- Slow users: 3000-5000ms waits

## 📈 Monitoring Results

After running simulations, check Sentry for:

1. **Performance Tab**
   - Transaction summary
   - Slow transactions
   - Transaction traces

2. **Discover Tab**
   - User interaction patterns
   - Error rates by transaction

3. **Session Replay**
   - Visual playback of user sessions
   - Error context

4. **Dashboards**
   - Custom metrics
   - Conversion funnels

## 🐛 Troubleshooting

### Common Issues

1. **"Element not found" errors**
   - Ensure app is running latest build with testIDs
   - Check if products are loaded from backend

2. **Slow performance**
   - Reduce parallel executions
   - Increase wait times between actions

3. **Network errors**
   - Verify backend is accessible
   - Check API_BASE_URL configuration

### Debug Mode

Run with Maestro debug flag for detailed output:
```bash
maestro test --debug .maestro/user-behaviors/happy-path-purchase.yml
```

## 🔄 CI/CD Integration

These workflows can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run User Simulations
  run: |
    .maestro/run-user-simulations.sh continuous 5
```

This helps ensure performance monitoring is always populated with fresh data after deployments.
