# Fixing "Email is invalid" Error in Supabase

If you're getting "Email address is invalid" errors from Supabase even with valid emails like `test@gmail.com`, check these settings:

## 1. Check Email Auth Settings

Go to your Supabase Dashboard:
- **Authentication** → **Providers** → **Email**
- Make sure **"Enable Email provider"** is toggled ON
- Check **"Confirm email"** setting:
  - If enabled, users need to verify their email before signing in
  - For testing, you can disable this temporarily

## 2. Check Email Validation Rules

In Supabase Dashboard:
- **Authentication** → **Settings** → **Email Auth**
- Look for any email validation rules or restrictions
- Some Supabase projects have email domain restrictions

## 3. Check Rate Limiting

Supabase has rate limits on signups. If you're testing multiple times:
- Wait a few minutes between attempts
- Or check **Authentication** → **Settings** for rate limit settings

## 4. Check Email Templates

Sometimes email template configuration can cause issues:
- **Authentication** → **Email Templates**
- Make sure templates are properly configured

## 5. Test with Different Email

Try:
- A different email domain (not gmail.com)
- A real email you own
- Check if the issue is domain-specific

## 6. Check Supabase Logs

In Supabase Dashboard:
- **Logs** → **Auth Logs**
- Look for detailed error messages about why the email was rejected

## Quick Fix for Testing

If you need to test quickly:
1. Go to **Authentication** → **Settings**
2. Temporarily disable **"Confirm email"**
3. Try signing up again
4. Re-enable it for production

## Common Causes

1. **Email confirmation required**: Supabase might require email verification
2. **Domain restrictions**: Some projects block certain email domains
3. **Rate limiting**: Too many signup attempts
4. **Email format validation**: Supabase's internal validation might be stricter

If the issue persists, check the Supabase logs for more details.

