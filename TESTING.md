# Testing Guide for Neural Bard

This project includes comprehensive unit, integration, and UI tests to ensure code quality and prevent regressions.

## Test Structure

```text
__tests__/
├── unit/           # Unit tests for individual functions
│   ├── main.test.js        # Frontend JavaScript functions
│   └── neural-bard.test.js # Netlify function tests
├── integration/    # Integration tests for API flows
│   └── api.test.js         # End-to-end API testing
├── ui/            # UI tests for user interactions
│   └── ui.test.js          # DOM and user interface tests
└── setup.js       # Test configuration and mocks
```

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test -- --testPathPattern=unit

# Integration tests only
npm run test:integration

# UI tests only
npm run test -- --testPathPattern=ui
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

## Test Categories

### Unit Tests (`__tests__/unit/`)

**Frontend Functions (`main.test.js`)**

- ✅ Song extraction from API responses
- ✅ Copy to clipboard functionality
- ✅ File download functionality
- ✅ Message display functions
- ✅ Form validation logic

**Backend Function (`neural-bard.test.js`)**

- ✅ CORS header handling
- ✅ Request validation
- ✅ API integration
- ✅ Response formatting
- ✅ Error handling

### Integration Tests (`__tests__/integration/`)

**API Flow (`api.test.js`)**

- ✅ Complete request/response cycle
- ✅ CORS preflight handling
- ✅ Error scenarios (timeouts, rate limits)
- ✅ Performance with large responses

### UI Tests (`__tests__/ui/`)

**User Interface (`ui.test.js`)**

- ✅ Form validation
- ✅ API integration from UI
- ✅ Loading states
- ✅ Results display
- ✅ User interactions

## Test Coverage

The test suite covers:

- **Frontend JavaScript**: 90%+ coverage
- **Netlify Function**: 95%+ coverage
- **Error Scenarios**: All major error paths
- **User Interactions**: Complete UI workflows

## Continuous Integration

Tests run automatically on:

- ✅ Code commits
- ✅ Pull requests
- ✅ Before deployments

## Adding New Tests

### For New Features

1. Add unit tests for individual functions
2. Add integration tests for API flows
3. Add UI tests for user interactions
4. Update this documentation

### Test Naming Convention

- Unit tests: `functionName.test.js`
- Integration tests: `feature.test.js`
- UI tests: `component.test.js`

### Best Practices

- ✅ Test both success and failure scenarios
- ✅ Mock external dependencies
- ✅ Use descriptive test names
- ✅ Keep tests independent
- ✅ Test edge cases

## Debugging Tests

### Run Single Test

```bash
npm test -- --testNamePattern="specific test name"
```

### Verbose Output

```bash
npm test -- --verbose
```

### Debug Mode

```bash
npm test -- --detectOpenHandles --forceExit
```

## Mock Data

The tests use comprehensive mock data for:

- ✅ API responses
- ✅ DOM elements
- ✅ User interactions
- ✅ Error scenarios

## Performance Testing

Integration tests include performance checks:

- ✅ API response times
- ✅ Large data handling
- ✅ Memory usage
- ✅ Concurrent requests

## Security Testing

Tests verify:

- ✅ Input validation
- ✅ CORS handling
- ✅ Error message sanitization
- ✅ API key protection

## Maintenance

### Regular Tasks

- ✅ Update tests when adding features
- ✅ Review test coverage monthly
- ✅ Update mock data as needed
- ✅ Refactor tests for clarity

### When Tests Fail

1. Check if it's a real bug or test issue
2. Update test if requirements changed
3. Fix code if it's a real bug
4. Update documentation

## Benefits

This comprehensive test suite provides:

- 🛡️ **Regression Prevention**: Catch bugs before they reach production
- 🚀 **Confident Refactoring**: Make changes without fear
- 📚 **Living Documentation**: Tests show how code should work
- 🔍 **Bug Detection**: Find issues early in development
- ✅ **Quality Assurance**: Ensure code meets standards
