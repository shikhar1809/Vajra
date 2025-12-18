# VAJRA - Enterprise Cybersecurity Platform

![Vajra Logo](https://img.shields.io/badge/Vajra-Cybersecurity-0EA5E9?style=for-the-badge&logo=shield&logoColor=white)

**Comprehensive Cybersecurity Protection Platform for Small & Medium Enterprises**

Vajra is an all-in-one cybersecurity solution featuring intelligent threat detection, vendor security management, employee protection, and automated penetration testing—all in one powerful platform.

---

## 🚀 Features

### 🛡️ Vajra Shield - Intelligent Traffic Protection
- **Real-time Traffic Monitoring**: Live dashboard with traffic analytics and anomaly detection
- **AI-Powered Anomaly Detection**: Automatically detects unusual traffic patterns and potential threats
- **Bunker Mode**: Multi-challenge verification system that activates during security threats
  - OTP Verification (Email/SMS)
  - Pen Tool Drawing (Canvas-based pattern recognition)
  - CAPTCHA Challenge
  - Behavioral Analysis (Mouse movement & typing patterns)
  - Device Fingerprinting
- **Auto-Activation**: Automatically triggers bunker mode when traffic exceeds threshold
- **Whitelist Management**: Trusted IPs and users bypass security challenges

### 🔍 Vajra Scout - Vendor Security Intelligence
- **Vendor Security Scoring**: Comprehensive security assessment for all vendors
- **Compliance Tracking**: Monitor SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, and more
- **Breach Attribution**: Track and attribute data breaches to responsible vendors
- **Dark Web Monitoring**: Check if vendor data appears in breaches
- **Automated Assessments**: Periodic re-assessment of vendor security posture
- **Security Scorecards**: Public/private security ratings for vendors

### 👁️ Vajra Sentry - Employee Protection Suite
- **Phishing Detection**: URL and email scanning using Google Safe Browsing API
- **Document Malware Scanner**: Scan files for viruses and malware before opening
- **Geolocation Tracking**: Real-time employee location monitoring with OpenStreetMap
- **Geofence Enforcement**: Restrict access based on designated workspace boundaries
- **Network Verification**: Ensure employees connect from approved routers/networks
- **Security Awareness**: Training modules and gamification

### 💻 Vajra Agenios - Automated Security Testing
- **Static Code Analysis**: Detect vulnerabilities in source code
- **Penetration Testing**: Simulate real-world attacks on your applications
- **Vulnerability Scanning**: Check for OWASP Top 10 and CWE vulnerabilities
- **Attack Simulation**: Test defenses against SQL injection, XSS, CSRF, and more
- **Compliance Scanning**: Verify adherence to security standards
- **AI-Powered Detection**: Machine learning models for zero-day vulnerability detection
- **Remediation Recommendations**: AI-suggested fixes for identified vulnerabilities

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI Components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Charts**: Recharts
- **Maps**: Leaflet.js with OpenStreetMap
- **Icons**: Lucide React

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/vajra.git
cd vajra
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://trhfokxznsqlfiskhmxe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google Safe Browsing API (Optional - for Vajra Sentry)
GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here

# Application Settings
NEXT_PUBLIC_APP_NAME=Vajra
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Setup

The application requires a Supabase database with the following tables:

### Core Tables
- `organizations` - Organization management
- `users` - User profiles and authentication
- `notifications` - System notifications

### Shield Module Tables
- `traffic_logs` - Traffic monitoring data
- `anomaly_events` - Detected anomalies
- `bunker_challenges` - Challenge verification records
- `whitelists` - Trusted IPs and users

### Scout Module Tables
- `vendors` - Vendor information
- `vendor_assessments` - Security assessment results
- `breach_incidents` - Data breach tracking
- `compliance_records` - Compliance certifications

### Sentry Module Tables
- `employee_locations` - Geolocation tracking
- `phishing_checks` - URL safety checks
- `document_scans` - Malware scan results
- `geofences` - Workspace boundaries
- `network_verifications` - Approved networks

### Agenios Module Tables
- `code_scans` - Code analysis records
- `vulnerabilities` - Detected vulnerabilities
- `attack_simulations` - Penetration test results
- `security_reports` - Generated reports

---

## 🎨 Design Philosophy

Vajra features a **premium cybersecurity-themed design** with:

- **Dark Mode First**: Optimized for security operations centers
- **Cyber Color Palette**: Electric blues, purples, and vibrant accents
- **Glassmorphism Effects**: Modern, translucent UI elements
- **Smooth Animations**: Micro-interactions for enhanced UX
- **Responsive Design**: Mobile, tablet, and desktop optimized

---

## 📊 Module Overview

| Module | Purpose | Key Features |
|--------|---------|--------------|
| **Shield** | Traffic Protection | Anomaly detection, Bunker mode, Real-time monitoring |
| **Scout** | Vendor Security | Security scoring, Breach tracking, Compliance monitoring |
| **Sentry** | Employee Protection | Phishing detection, Malware scanning, Geofencing |
| **Agenios** | Code Security | Static analysis, Penetration testing, Vulnerability scanning |

---

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Real-time Threat Detection**: Instant anomaly alerts
- **Multi-Factor Challenges**: Progressive security verification
- **End-to-End Encryption**: Secure data transmission
- **Audit Logging**: Complete activity tracking

---

## 🚦 Getting Started

1. **Explore the Dashboard**: Navigate to the homepage to see all four modules
2. **Configure Shield**: Set up traffic monitoring and bunker mode thresholds
3. **Add Vendors**: Use Scout to assess your third-party vendors
4. **Enable Sentry**: Protect employees with phishing detection and geofencing
5. **Scan Code**: Upload your codebase to Agenios for security analysis

---

## 📈 Roadmap

- [ ] AI-powered threat prediction
- [ ] Integration with SIEM platforms
- [ ] Mobile app for iOS and Android
- [ ] Advanced reporting and analytics
- [ ] Multi-tenant support
- [ ] API for third-party integrations

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💬 Support

For support, email support@vajra.io or join our Slack community.

---

## 🌟 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI components from [ShadCN UI](https://ui.shadcn.com/)
- Maps by [OpenStreetMap](https://www.openstreetmap.org/)

---

**Made with ❤️ for SME Cybersecurity**
