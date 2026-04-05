# Google OAuth Configuration Guide for NeexMeet

## ❌ Problem
Getting `https://neexmeet.com/?error=invalid_code` after clicking Continue button

## ✅ Solution Steps

### Step 1: Verify Environment Variables

Make sure these are set in your deployment environment (Netlify/Vercel):

```
NEXT_PUBLIC_BETTER_AUTH_URL=https://neexmeet.com
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_secret
BETTER_AUTH_SECRET=your_secret_key
DATABASE_URL=your_database_url
```

### Step 2: Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (type: Web application)
5. Click to edit it

#### Authorized JavaScript Origins
Add:
```
https://neexmeet.com
http://localhost:3000
```

#### Authorized Redirect URIs  
Add (EXACTLY these URLs):
```
https://neexmeet.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

⚠️ **CRITICAL**: The redirect URI must have `/api/auth/callback/google` path

6. Click **Save**
7. Copy the **Client ID** and **Client Secret**
8. Update your environment variables

### Step 3: Deployment Checklist

**If using Netlify:**
1. Go to Site Settings → Environment
2. Add all environment variables above
3. Redeploy the site

**If using Vercel:**
1. Go to Settings → Environment Variables
2. Add all environment variables above
3. Redeploy

### Step 4: Clear Cache and Test

1. Local test (development):
   ```
   npm run dev
   # Visit http://localhost:3000/sign-in
   # Test Google login
   ```

2. Production test:
   - Clear browser cache/cookies
   - Visit https://neexmeet.com/sign-in
   - Click Google login button
   - Should redirect to dashboard/meetings

### Step 5: Verify Better Auth Setup

Run this in your terminal to check if environment is correct:
```bash
echo "NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL"
echo "GOOGLE_CLIENT_ID has value: $([[ -n "$GOOGLE_CLIENT_ID" ]] && echo 'YES' || echo 'NO')"
```

## 🔍 Debugging

If still getting error, check:

1. **Browser Console**: Open DevTools → Console for auth error messages
2. **Netlify/Vercel Logs**: Check deployment logs for any auth errors
3. **Database**: Verify DATABASE_URL is correct and accessible
4. **BETTER_AUTH_SECRET**: Make sure it's a strong random string

## Common Issues

| Issue | Solution |
|-------|----------|
| `error=invalid_code` | Redirect URI mismatch. Verify `/api/auth/callback/google` in Google Console |
| `error=access_denied` | User denied permission. Ask them to try again and accept |
| Redirects back to sign-in | Session not being created. Check DATABASE_URL |
| Shows auth page briefly then loads | Normal behavior. Auth client is validating session |

## Testing Commands

```bash
# Test local auth route
curl http://localhost:3000/api/auth/providers

# Test production  
curl https://neexmeet.com/api/auth/providers
```

Both should return configured providers (google, github, etc.)
