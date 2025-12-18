# Vajra - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd Vajra_AntiGravity
npm install
```

### Step 2: Configure Environment
The `.env.local` file is already configured with your Supabase credentials:
- Supabase URL: `https://trhfokxznsqlfiskhmxe.supabase.co`
- Anon Key: Already set

### Step 3: Set Up Database
1. Go to your Supabase project: https://supabase.com/dashboard/project/trhfokxznsqlfiskhmxe
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL to create all tables

### Step 4: Run Development Server
```bash
npm run dev
```

### Step 5: Open Browser
Navigate to http://localhost:3000

---

## 📋 What's Included

### ✅ Complete Application
- **Homepage**: Landing page with module overview
- **Vajra Shield**: Traffic monitoring and bunker mode
- **Vajra Scout**: Vendor security management
- **Vajra Sentry**: Employee protection tools
- **Vajra Agenios**: Code security analysis

### ✅ Premium Design
- Dark mode cybersecurity theme
- Responsive layout (mobile, tablet, desktop)
- Smooth animations and transitions
- Custom color palette and components

### ✅ Ready for Production
- TypeScript for type safety
- Next.js 15 with App Router
- Supabase integration configured
- Environment variables set up

---

## 🗄️ Database Setup

Run the SQL in `supabase/schema.sql` to create:

**Core Tables:**
- `organizations` - Company management
- `users` - User accounts

**Shield Module:**
- `traffic_logs` - HTTP traffic data
- `anomaly_events` - Threat detection
- `bunker_challenges` - User verification
- `whitelists` - Trusted IPs/users

**Scout Module:**
- `vendors` - Vendor information
- `vendor_assessments` - Security scores
- `breach_incidents` - Data breaches

**Sentry Module:**
- `employee_locations` - Geolocation tracking
- `phishing_checks` - URL safety
- `document_scans` - Malware detection
- `geofences` - Workspace boundaries

**Agenios Module:**
- `code_scans` - Security analysis
- `vulnerabilities` - Code issues
- `attack_simulations` - Pen tests
- `security_reports` - Results

---

## 🎯 Next Steps

### Immediate Actions
1. **Set up database**: Run `supabase/schema.sql` in Supabase SQL Editor
2. **Test the app**: Explore all four modules
3. **Customize**: Update branding, colors, and content

### Future Enhancements
1. **Add Authentication**: Implement Supabase Auth
2. **Connect Real Data**: Replace mock data with Supabase queries
3. **Enable Realtime**: Add live updates for traffic monitoring
4. **Integrate APIs**: 
   - Google Safe Browsing for phishing detection
   - Malware scanning services
   - Code analysis tools

### Optional Features
1. **Email Notifications**: Set up email alerts for threats
2. **PDF Reports**: Generate security reports
3. **Mobile App**: Build React Native version
4. **API Endpoints**: Create REST/GraphQL APIs

---

## 📚 Documentation

- **README.md**: Complete feature list and installation guide
- **walkthrough.md**: Visual demonstration with screenshots
- **supabase/schema.sql**: Database structure

---

## 🛠️ Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🎨 Customization

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  cyber: {
    blue: "#0EA5E9",    // Your primary color
    purple: "#8B5CF6",  // Scout module
    green: "#10B981",   // Sentry module
    orange: "#F59E0B",  // Agenios module
  }
}
```

### Update Branding
Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: "Your Company - Cybersecurity",
  description: "Your custom description",
};
```

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use Row Level Security** - RLS policies are included in schema
3. **Rotate API keys** - Regularly update Supabase keys
4. **Enable 2FA** - For Supabase dashboard access

---

## 💡 Tips

- **Mock Data**: Currently using sample data - replace with real Supabase queries
- **Real-time Updates**: Use Supabase Realtime for live traffic monitoring
- **File Uploads**: Use Supabase Storage for document scanning
- **Authentication**: Implement Supabase Auth for user login

---

## 🆘 Troubleshooting

**Issue**: Build errors
- **Solution**: Run `npm install` to ensure all dependencies are installed

**Issue**: Database connection fails
- **Solution**: Check `.env.local` has correct Supabase credentials

**Issue**: Styles not loading
- **Solution**: Ensure `tailwindcss-animate` is installed: `npm install tailwindcss-animate`

---

## 📞 Support

For questions or issues:
1. Check the README.md for detailed documentation
2. Review the walkthrough.md for visual guides
3. Inspect the code comments for implementation details

---

**Built with ❤️ for SME Cybersecurity**
