# Domain Migration Guide: pointpal.app (Netlify)

## Migration Checklist

### ✅ Step 1: Netlify Custom Domain Setup

1. Log into your Netlify dashboard: https://app.netlify.com
2. Select your site (pointwith.me)
3. Go to **Site settings** → **Domain management**
4. Click **Add custom domain**
5. Enter: `pointpal.app`
6. Click **Verify** and confirm you own the domain

Netlify will provide you with the DNS records to configure.

---

### ✅ Step 2: DNS Configuration (Porkbun)

After adding the custom domain in Netlify, configure DNS in Porkbun:

#### Log into Porkbun:
1. Go to https://porkbun.com
2. Navigate to DNS settings for `pointpal.app`

#### Option A: Using Netlify DNS (Recommended)
If Netlify provides name servers:
```
Type: NS
Host: @
Answer: dns1.p0X.nsone.net (use the exact servers Netlify provides)
TTL: 600
```

#### Option B: Using Porkbun DNS with Netlify Load Balancer
Configure these records as shown in your Netlify dashboard:

**For apex domain (pointpal.app):**
```
Type: A
Host: @
Answer: 75.2.60.5
TTL: 600
```

**For www subdomain:**
```
Type: CNAME
Host: www
Answer: <your-netlify-site>.netlify.app
TTL: 600
```

**Note:** Replace `<your-netlify-site>` with your actual Netlify subdomain.

#### Netlify-specific CNAME (if using subdomain):
If you want to use the apex domain, Netlify will show you the exact DNS configuration in the UI. Follow those instructions exactly.

**For wildcard SSL:**
```
Type: CNAME
Host: *
Answer: <your-netlify-site>.netlify.app
TTL: 600
```

#### CAA Records (Optional but recommended):
```
Type: CAA
Host: @
Answer: 0 issue "letsencrypt.org"
TTL: 600
```

#### Save DNS Settings
- Click **Save** in Porkbun
- Wait for DNS propagation (5-60 minutes)

---

### ✅ Step 3: Verify DNS in Netlify

1. Return to Netlify → **Domain settings**
2. Wait for DNS check to complete (shows green checkmark)
3. Netlify will automatically provision SSL certificate
4. Enable **HTTPS** (should be automatic)
5. Set up **Redirect rules** if needed:
   - Redirect www to apex (or vice versa)
   - Force HTTPS

**Netlify Redirects (_redirects file or netlify.toml):**
If you need custom redirects, create a `public/_redirects` file:
```
# Redirect www to apex
https://www.pointpal.app/* https://pointpal.app/:splat 301!

# SPA fallback
/*    /index.html   200
```

---

### 🔥 Step 4: Firebase Configuration

#### Update Authorized Domains:
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add: `pointpal.app`
5. Add: `<your-netlify-site>.netlify.app` (keep Netlify subdomain as backup)
6. Keep existing domains during migration for zero downtime
7. Remove old domain after migration is complete

#### Update OAuth Redirect URIs:
1. In Firebase Console → **Authentication** → **Sign-in method**
2. For each provider (Google, Twitter, GitHub), update redirect URIs:
   - Add: `https://pointpal.app/__/auth/handler`
   - Add: `https://<your-netlify-site>.netlify.app/__/auth/handler` (backup)
   - Keep old URIs during migration

---

### 🎫 Step 5: Jira OAuth Configuration (Future)

When you set up Jira integration, update the Atlassian OAuth app:

1. Go to https://developer.atlassian.com/console
2. Select your OAuth app
3. Under **Authorization** → **Callback URL**, add:
   - `https://pointpal.app/settings/jira/callback`
4. Update environment variables (Netlify):
   - Go to Netlify → **Site settings** → **Environment variables**
   - Update: `VITE_JIRA_REDIRECT_URI=https://pointpal.app/settings/jira/callback`

---

### 📦 Step 6: Deploy

#### Update Environment Variables in Netlify (if needed):
1. Go to Netlify → **Site settings** → **Environment variables**
2. Verify Firebase config variables are set
3. No changes needed unless you're updating OAuth URLs

#### Deploy:
Netlify will automatically deploy when you push to your connected Git branch.

```bash
# Push latest commits
git add -A
git commit -m "chore: migrate domain to pointpal.app (Netlify)"
git push origin master
```

Netlify will:
- Automatically build and deploy
- Provision SSL certificate
- Update DNS settings

**Manual Deploy (if needed):**
1. Go to Netlify → **Deploys**
2. Click **Trigger deploy** → **Deploy site**

---

### ✅ Step 7: Verify Migration

**DNS Verification:**
```bash
# Check A records
dig pointpal.app

# Check CNAME records
dig www.pointpal.app

# Check from multiple locations
open https://dnschecker.org/#A/pointpal.app

# Verify SSL
curl -I https://pointpal.app
```

**Netlify Status Check:**
1. Go to Netlify → **Domain settings**
2. Verify all domains show green checkmark
3. Check that SSL certificate is provisioned

**Site Verification:**
- [ ] https://pointpal.app loads correctly
- [ ] https://www.pointpal.app redirects (if configured)
- [ ] HTTPS certificate is valid (green lock)
- [ ] Firebase authentication works
- [ ] All routes work correctly
- [ ] Social login providers work
- [ ] Build/deploy is successful

**Browser Testing:**
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile devices

---

### 📝 Step 8: Update Documentation & Links

**Update references to old domain:**
- [ ] README.md
- [ ] package.json (if homepage field exists)
- [ ] Any marketing materials
- [ ] Social media profiles
- [ ] Email signatures

**Netlify Settings:**
- [ ] Update site name in Netlify (optional)
- [ ] Configure deploy notifications
- [ ] Set up form handling (if used)

---

## Netlify-Specific Features

### Redirects & Rewrites
Create `public/_redirects`:
```
# Redirect www to apex
https://www.pointpal.app/* https://pointpal.app/:splat 301!

# Redirect old domain (if you control it)
https://pointwith.me/* https://pointpal.app/:splat 301!

# SPA fallback (React Router)
/*    /index.html   200
```

Or use `netlify.toml`:
```toml
[[redirects]]
  from = "https://www.pointpal.app/*"
  to = "https://pointpal.app/:splat"
  status = 301
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Headers
Add security headers in `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Build Settings
Verify in Netlify → **Site settings** → **Build & deploy**:
```
Build command: pnpm build
Publish directory: build
Node version: 18 (or higher)
```

---

## Rollback Plan

If issues occur during migration:

1. **Revert DNS:**
   - Point DNS back to old Netlify site
   - Wait for propagation (or use Netlify DNS for instant rollback)

2. **Revert Netlify Domain:**
   - Remove custom domain from Netlify settings
   - Site will revert to `<your-netlify-site>.netlify.app`

3. **Revert Firebase:**
   - Remove `pointpal.app` from authorized domains
   - Keep old domains active

---

## Common Issues & Troubleshooting

### DNS Not Propagating
- **Solution:** Wait longer (typically 5-60 min with Porkbun)
- **Check:** Use https://dnschecker.org to see global propagation
- **Netlify:** Check Domain settings for DNS status
- **Flush local DNS:**
  - Mac: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
  - Windows: `ipconfig /flushdns`
  - Linux: `sudo systemd-resolve --flush-caches`

### Netlify "DNS Verification Failed"
- **Solution:** Verify DNS records match exactly what Netlify shows
- **Check:** Wait 10-20 minutes after DNS changes
- **Try:** Remove and re-add custom domain in Netlify

### HTTPS Certificate Not Working
- **Solution:** Netlify auto-provisions Let's Encrypt certificates
- **Wait:** Can take 5-10 minutes after DNS verification
- **Force:** Try "Renew certificate" in Netlify → Domain settings
- **Check:** Ensure DNS is fully propagated first

### Firebase Auth Not Working
- **Solution:** Verify `pointpal.app` is in Firebase authorized domains
- **Check:** Browser console for CORS errors
- **Whitelist:** Add both Netlify subdomain and custom domain

### Build Failures
- **Check:** Netlify deploy logs
- **Verify:** Environment variables are set correctly
- **Node Version:** Ensure compatible Node version in Netlify settings

### "Page Not Found" on Refresh
- **Solution:** Need SPA redirects configured
- **Add:** `public/_redirects` file with SPA fallback rule
- **Verify:** File is being copied to build output

---

## Post-Migration Tasks

### Immediate (Day 1)
- [ ] Monitor Netlify deploy logs
- [ ] Test all critical user flows
- [ ] Check Netlify analytics
- [ ] Verify all environment variables work

### Short-term (Week 1)
- [ ] Monitor DNS globally
- [ ] Remove old domain from Firebase (if fully migrated)
- [ ] Update third-party integrations
- [ ] Set up Netlify notifications

### Long-term (Month 1)
- [ ] Configure Netlify Analytics (optional)
- [ ] Set up deploy previews for PRs
- [ ] Consider Netlify Functions for backend logic
- [ ] Review bandwidth usage

---

## Netlify Resources

- **Netlify Docs:** https://docs.netlify.com/domains-https/custom-domains/
- **DNS Configuration:** https://docs.netlify.com/domains-https/custom-domains/configure-external-dns/
- **SSL Certificates:** https://docs.netlify.com/domains-https/https-ssl/
- **Redirects:** https://docs.netlify.com/routing/redirects/
- **SPA Routing:** https://docs.netlify.com/routing/redirects/redirect-options/#history-pushstate-and-single-page-apps

---

**Migration Date:** October 26, 2025
**Old Domain:** pointwith.me (or current Netlify subdomain)
**New Domain:** pointpal.app (Porkbun)
**Hosting:** Netlify
**Status:** Ready to migrate
