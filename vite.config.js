export default defineConfig({
    define: {
        'process.env': {
            FIREBASE_API_KEY: JSON.stringify(import.meta.env.FIREBASE_API_KEY),
            FIREBASE_AUTH_DOMAIN: JSON.stringify(import.meta.env.FIREBASE_AUTH_DOMAIN),
            FIREBASE_PROJECT_ID: JSON.stringify(import.meta.env.FIREBASE_PROJECT_ID),
            FIREBASE_STORAGE_BUCKET: JSON.stringify(import.meta.env.FIREBASE_STORAGE_BUCKET),
            FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(import.meta.env.FIREBASE_MESSAGING_SENDER_ID),
            FIREBASE_APP_ID: JSON.stringify(import.meta.env.FIREBASE_APP_ID),
            FIREBASE_MEASUREMENT_ID: JSON.stringify(import.meta.env.FIREBASE_MEASUREMENT_ID),
        },
    },
});
