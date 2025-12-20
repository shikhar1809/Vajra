# @vajra/shield

Official Vajra Shield SDK for protecting your applications from bots, DDoS attacks, and malicious traffic.

## Installation

```bash
npm install @vajra/shield
```

## Quick Start

### Next.js Middleware

```typescript
// middleware.ts
import { createVajraShield } from '@vajra/shield'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export default createVajraShield({
  apiKey: process.env.VAJRA_API_KEY!,
  workspaceId: process.env.VAJRA_WORKSPACE_ID!,
  enableBotDetection: true,
  enableBunkerMode: true,
})
```

### Express Middleware

```javascript
const express = require('express')
const { vajraShield } = require('@vajra/shield')

const app = express()

app.use(vajraShield({
  apiKey: process.env.VAJRA_API_KEY,
  workspaceId: process.env.VAJRA_WORKSPACE_ID,
  enableBotDetection: true,
}))
```

### Protect Specific Routes

```typescript
import { vajraProtect } from '@vajra/shield'

export default vajraProtect(async function handler(req, res) {
  // Your protected route logic
  res.json({ success: true })
}, {
  bunkerModeThreshold: 90, // Stricter for this route
})
```

## Configuration

```typescript
{
  apiKey: string              // Required: Your Vajra API key
  workspaceId: string         // Required: Your workspace ID
  apiUrl?: string             // Optional: Custom API URL
  enableBotDetection?: boolean // Default: true
  enableBunkerMode?: boolean   // Default: true
  bunkerModeThreshold?: number // Default: 80 (0-100)
  whitelistedIPs?: string[]    // IPs to skip
  whitelistedPaths?: string[]  // Paths to skip (supports wildcards)
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}
```

## Features

- ✅ Real-time bot detection
- ✅ Traffic monitoring and logging
- ✅ Bunker mode (human verification challenges)
- ✅ Anomaly detection
- ✅ IP whitelisting
- ✅ Path whitelisting
- ✅ Automatic failover (fails open if service is down)

## License

MIT
