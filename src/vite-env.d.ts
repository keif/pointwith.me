/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_DATABASE_URL: string;
    readonly VITE_JIRA_CLIENT_ID: string;
    readonly VITE_JIRA_CLIENT_SECRET: string;
    readonly VITE_JIRA_REDIRECT_URI: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
