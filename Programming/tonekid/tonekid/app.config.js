// Extends app.json so we can inject env vars into the client bundle without
// using the EXPO_PUBLIC_ prefix convention. Plain env vars from .env.local are
// read at build time and exposed via expo.extra.
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
    // NOTE: OPENAI_API_KEY is intentionally NOT exposed here. The AI calls
    // are proxied through Supabase Edge Functions (adapt-tone, research-song)
    // which hold the OpenAI key as a server-side secret.
    revenuecatIosKey: process.env.REVENUECAT_IOS_KEY,
    revenuecatAndroidKey: process.env.REVENUECAT_ANDROID_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  },
});
