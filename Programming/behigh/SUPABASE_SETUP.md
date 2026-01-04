# 🚀 Supabase Backend Setup Guide

This guide will help you set up Supabase as the backend for your BeHigh app.

## 📋 Prerequisites

- A Supabase account (free tier works great!)
- Basic understanding of SQL and APIs

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: BeHigh
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait for the project to finish setting up (~2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Configure Your App

### Option A: Using app.config.js (Recommended)

1. Open `app.config.js` in your project root
2. Add your credentials to the `extra` section:

```javascript
export default {
  expo: {
    // ... other config
    extra: {
      supabaseUrl: "https://your-project.supabase.co",
      supabaseAnonKey: "your-anon-key-here",
    },
  },
};
```

### Option B: Using Environment Variables

1. Create a `.env` file in your project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Install dotenv:

```bash
npx expo install react-native-dotenv
```

## Step 4: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"**
6. You should see a success message ✅

## Step 5: Create Storage Buckets

1. In your Supabase dashboard, go to **Storage**
2. Create these 4 buckets:

| Bucket Name | Public | Purpose                    |
| ----------- | ------ | -------------------------- |
| `posts`     | ✅ Yes | User post photos           |
| `reactions` | ✅ Yes | Reaction selfies           |
| `profiles`  | ✅ Yes | Profile pictures           |
| `journal`   | ❌ No  | Private voice recordings   |

**To create each bucket:**

1. Click **"New bucket"**
2. Enter the bucket name
3. Toggle "Public bucket" (except for `journal`)
4. Click **"Create bucket"**

## Step 6: Configure Storage Policies

For public buckets (`posts`, `reactions`, `profiles`):

1. Click on the bucket
2. Go to **"Policies"**
3. Add these policies:

**SELECT (View):**

```sql
bucket_id = 'posts' AND auth.role() = 'authenticated'
```

**INSERT (Upload):**

```sql
bucket_id = 'posts' AND auth.uid() = owner
```

**DELETE:**

```sql
bucket_id = 'posts' AND auth.uid() = owner
```

Repeat for each public bucket!

## Step 7: Test Your Setup

1. Restart your Expo app:

```bash
npx expo start --clear
```

2. You should see in the console:

```
✅ Supabase client initialized
```

3. Try creating an account in the app
4. Check your Supabase dashboard → **Authentication** → **Users** to see the new user

## Step 8: Enable Email Auth (Optional)

If you want email/password authentication:

1. Go to **Authentication** → **Providers**
2. Click on **"Email"**
3. Toggle **"Enable Email provider"**
4. Configure email templates as needed

## Step 9: Enable Apple Sign In (Optional)

For "Sign in with Apple":

1. Go to **Authentication** → **Providers**
2. Click on **"Apple"**
3. Follow Supabase's guide to set up Apple developer credentials

## 🎉 You're Done!

Your app is now connected to Supabase!

## 📊 What You Get

- ✅ User authentication
- ✅ Real-time data sync
- ✅ Secure file storage
- ✅ Automatic backups
- ✅ Row-level security
- ✅ Scalable infrastructure

## 🐛 Troubleshooting

### "Supabase not configured" warning

- Check that your credentials are correct in `app.config.js`
- Make sure there are no extra spaces or quotes
- Restart your app with `--clear` flag

### "Syntax error" in SQL

- Make sure you copied the ENTIRE `supabase-schema.sql` file
- Run it all at once, not in parts

### Storage upload fails

- Check that you created the storage buckets
- Verify the bucket policies are set correctly
- Make sure the bucket names match exactly

### Authentication fails

- Verify Email provider is enabled
- Check that the user table was created properly
- Look at the Supabase logs for error details

## 📚 Learn More

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## 🆘 Need Help?

- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- Supabase GitHub: [github.com/supabase](https://github.com/supabase/supabase)

---

**Happy Building! 🚀**

