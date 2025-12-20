
async function checkOSV() {
    console.log('Testing connection to https://api.osv.dev...');
    const pkg = { package: { name: 'lodash', ecosystem: 'npm' }, version: '4.17.20' };
    try {
        const response = await fetch('https://api.osv.dev/v1/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pkg)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Connection Successful!');
        console.log(`Query: lodash@4.17.20`);
        console.log(`Result: ${data.vulns ? data.vulns.length + ' vulnerabilities found' : 'No vulnerabilities found'}`);

        if (data.vulns && data.vulns.length > 0) {
            console.log('Sample Vuln ID:', data.vulns[0].id);
        }

    } catch (e) {
        console.error('OSV Connection Failed:', e);
        process.exit(1);
    }
}

checkOSV();
