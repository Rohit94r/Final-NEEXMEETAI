# Failed to Fetch - Authentication Error Fix Guide

## Problem Summary
You're experiencing a **"Failed to fetch"** runtime error during login on Next.js 15.5.14 with Better Auth.

---

## Root Cause Analysis

The error occurs because the authentication client doesn't know the correct URL to reach your API endpoints. Here's what happens:

### Default Behavior (BROKEN):
```
Client URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"
```

**In Production:**
1. Your app runs at: `https://yourdomain.com` (or Netlify URL)
2. Auth client defaults to: `http://localhost:3000` (because env var is missing)
3. Browser tries to reach `localhost:3000` from `https://yourdomain.com`
4. Fetch fails → "Failed to fetch" error

**In Development (localhost):**
- Usually works because both frontend and API are on `localhost:3000`

---

## Solution Implemented

### 1. **Updated Auth Client Configuration** ✓
**File:** `src/lib/auth-client.ts`

The auth client now automatically detects the correct base URL:
- In browser: Uses `window.location.origin` (your current domain)
- On server/build: Falls back to environment variable or localhost
- Still respects `NEXT_PUBLIC_BETTER_AUTH_URL` if explicitly set

```typescript
function getAuthBaseURL(): string {
  const envUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  
  if (envUrl) {
    return envUrl;  // Honored if set
  }

  if (typeof window !== "undefined") {
    return window.location.origin;  // Use current domain in browser
  }

  return "http://localhost:3000";  // Fallback for SSR/build
}
```

### 2. **Enhanced Error Messages** ✓
**Files:** 
- `src/modules/auth/ui/views/sign-in-view.tsx`
- `src/modules/auth/ui/views/sign-up-view.tsx`

Error messages now indicate the actual problem:
- Network connectivity issues
- Missing or misconfigured OAuth
- Duplicate email registration
- Invalid credentials

---

## Deployment Checklist

### Option A: Quick Fix (Recommended for Now)
The automatic URL detection should work without changes. Just verify:
1. ✓ App is deployed and accessible at your domain
2. ✓ API routes are responding at `/api/auth/*`

### Option B: Explicit Configuration (Best for Production)
Set the environment variable in your deployment:

**For Netlify:**
1. Go to Site Settings → Environment Variables
2. Add: `NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com`

**For Vercel:**
1. Go to Settings → Environment Variables
2. Add: `NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com`

**For Docker/Manual:**
Add to your `.env.local` or `.env`:
```env
NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com
```

---

## Debugging Steps

### 1. Check Browser Console
1. Open DevTools (F12 within the app at `/sign-in`)
2. Look for logs like:
   ```
   🔐 Initiating social login: {provider: "google", appOrigin: "https://yourdomain.com", ...}
   ```
3. Check the Network tab for failed requests to `/api/auth/*`

### 2. Verify API Availability
```bash
# Test if auth endpoint is reachable
curl https://yourdomain.com/api/auth/[...all]

# Should return 405 (Method Not Allowed) for GET
# Not "Connection Refused" or "Failed to fetch"
```

### 3. Check Environment Variables
Ensure these are set in production/deployment:
```env
DATABASE_URL=your_database_url
BETTER_AUTH_SECRET=your_secret_key
```

Missing these will cause `/api/auth/*` to return 503 error.

### 4. Review Server Logs
Look for errors like:
- `Missing required environment variable`
- `Failed to get session`
- `Database connection refused`

---

## Common Scenarios

### Scenario 1: Works Locally, Fails in Production
**Cause:** Environment variable not set in production
**Fix:** Set `NEXT_PUBLIC_BETTER_AUTH_URL` to your production domain

### Scenario 2: Fails on Both Local and Production
**Cause:** Missing server-side environment variables
**Fix:** Verify `DATABASE_URL` and `BETTER_AUTH_SECRET` are set

### Scenario 3: OAuth (Google/GitHub) Sign-in Fails
**Cause:** Redirect URI mismatch
**Fix:** Update OAuth app settings to include your domain's callback:
- Google: `https://yourdomain.com/api/auth/callback/google`
- GitHub: `https://yourdomain.com/api/auth/callback/github`

---

## Testing the Fix

### Local Development (should already work)
```bash
npm run dev
# Open http://localhost:3000/sign-in
# Try signing in - should work
```

### Production Verification
After deployment:
1. Open your deployed app → `/sign-in`
2. Try email sign-in or OAuth
3. Check browser console for the logs showing your domain
4. Verify redirect works after successful auth

---

## Key Files Modified

1. **src/lib/auth-client.ts**
   - Smart URL detection based on context
   
2. **src/modules/auth/ui/views/sign-in-view.tsx**
   - Better error messages
   - Network error detection
   - Console logging for debugging

3. **src/modules/auth/ui/views/sign-up-view.tsx**
   - Better error messages
   - Network error detection
   - Console logging for debugging

---

## Additional Notes

### Why This Happens
Better Auth requires the client to know where to POST auth requests. Public environment variables (starting with `NEXT_PUBLIC_`) are embedded in the browser bundle at build time. If not set, the client falls back to a default value that may not match your actual domain.

### Future Prevention
- Always set `NEXT_PUBLIC_BETTER_AUTH_URL` in production environments
- Use environment-specific `.env` files
- Test auth flow before deploying
- Monitor server logs for auth failures

### Related Documentation
- [Better Auth Configuration](https://www.better-auth.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
