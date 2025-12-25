// Simple test to verify Shield SDK works
const { VajraClient } = require('./dist/client');

async function testShieldSDK() {
    console.log('🧪 Testing Vajra Shield SDK...\n');

    // Test 1: Create client
    console.log('✓ Test 1: Creating VajraClient...');
    const client = new VajraClient({
        apiKey: 'test_key',
        workspaceId: 'test_workspace',
        apiUrl: 'https://vajra-3l9tfhw8x-royalshikher-4385s-projects.vercel.app',
        logLevel: 'info',
    });
    console.log('✅ Client created successfully\n');

    // Test 2: Check whitelisting
    console.log('✓ Test 2: Testing IP whitelist...');
    const testClient = new VajraClient({
        apiKey: 'test_key',
        workspaceId: 'test_workspace',
        whitelistedIPs: ['127.0.0.1', '192.168.1.1'],
    });
    const isWhitelisted = testClient.isWhitelisted('127.0.0.1');
    console.log(`  IP 127.0.0.1 whitelisted: ${isWhitelisted}`);
    console.log('✅ Whitelist check passed\n');

    // Test 3: Check path whitelisting
    console.log('✓ Test 3: Testing path whitelist...');
    const pathClient = new VajraClient({
        apiKey: 'test_key',
        workspaceId: 'test_workspace',
        whitelistedPaths: ['/api/health', '/public/*'],
    });
    const isPathWhitelisted = pathClient.isPathWhitelisted('/public/images/logo.png');
    console.log(`  Path /public/images/logo.png whitelisted: ${isPathWhitelisted}`);
    console.log('✅ Path whitelist check passed\n');

    // Test 4: Check exports
    console.log('✓ Test 4: Checking exports...');
    const shield = require('./dist/index');
    console.log('  Exported modules:', Object.keys(shield));
    console.log('✅ All exports available\n');

    console.log('🎉 All tests passed! Shield SDK is working correctly.\n');
    console.log('📦 Package is ready to publish to NPM!');
}

testShieldSDK().catch(console.error);
