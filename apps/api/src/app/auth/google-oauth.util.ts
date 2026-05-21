export function isGoogleOAuthEnabled(credentials?: {
  clientId?: string | null;
  clientSecret?: string | null;
}): boolean {
  const clientId = (credentials?.clientId ?? process.env.GOOGLE_CLIENT_ID)?.trim();
  const clientSecret = (
    credentials?.clientSecret ?? process.env.GOOGLE_CLIENT_SECRET
  )?.trim();
  return Boolean(clientId && clientSecret);
}
