# Google Drive OAuth setup

Contract DOCX uploads use a server-side OAuth refresh token for the Google account that owns the target folder. Secrets stay only in Vercel's sensitive environment variables; never put them in source, `.env.example`, chat, or client-side `NEXT_PUBLIC_` variables.

1. In the Google Cloud project, enable **Google Drive API** and configure the OAuth consent screen.
2. Create an OAuth client of type **Web application**. Add `https://developers.google.com/oauthplayground` as an authorised redirect URI.
3. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/), open its settings, select **Use your own OAuth credentials**, then enter the client ID and client secret. Keep **Access type: Offline** enabled.
4. Request the scope `https://www.googleapis.com/auth/drive.file`, authorise the Google account that owns `Contracte Proiecte`, and exchange the authorisation code for tokens. Copy only the refresh token.
5. In Vercel Production environment variables, add these as sensitive values:
   - `GOOGLE_DRIVE_OAUTH_CLIENT_ID`
   - `GOOGLE_DRIVE_OAUTH_CLIENT_SECRET`
   - `GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN`
   - Keep `GOOGLE_DRIVE_CONTRACTS_FOLDER_ID=1B4McqCVevbMxgJKAbY7UgtxxMmx4GAcF`.
6. Redeploy production, generate one contract DOCX, and verify both the Drive file and the related Documents record.

The old `GOOGLE_SERVICE_ACCOUNT_JSON` value is ignored by the OAuth uploader. Remove it from Vercel only after the live OAuth upload has been verified.
