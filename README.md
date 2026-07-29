# DONELVIT OS

Fire Engineering Management System.

## v0.1
Dashboard, project register, project card and Supabase connection for schema `donelvit`. Demo data is used until environment variables are configured.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Expose the custom schema in Supabase: `Project Settings → API → Exposed schemas → donelvit`. Never place the `service_role` key in the frontend.
