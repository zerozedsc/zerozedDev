import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

const jsToBottomNoModule = () => {
    return {
        name: 'move-main-js-to-body',
        transformIndexHtml(html) {
            // Remove type="module" from the main script tag and move it to the body
            let scriptTag = html.match(/<script\s+type="module"\s+crossorigin[^>]*src="\/js\/main\.js"><\/script>/);
            if (scriptTag) {
                scriptTag = scriptTag[0]; // Get the actual script tag
                html = html.replace(scriptTag, ''); // Remove the original script tag from its current location
                html = html.replace('</body>', `${scriptTag}\n</body>`); // Add the script tag before the closing </body>
            }
            return html;
        }
    };
}

export default defineConfig({
    define: {
        'import.meta.env': {
            VITE_FIREBASE_API_KEY: JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
            VITE_FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
            VITE_FIREBASE_PROJECT_ID: JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
            VITE_FIREBASE_STORAGE_BUCKET: JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET),
            VITE_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
            VITE_FIREBASE_APP_ID: JSON.stringify(process.env.VITE_FIREBASE_APP_ID),
            VITE_FIREBASE_MEASUREMENT_ID: JSON.stringify(process.env.VITE_FIREBASE_MEASUREMENT_ID),
        },
    },
    build: {
        target: 'esnext',
        outDir: 'dist',
        assetsDir: '', // Do not create an 'assets' folder in 'dist'
        rollupOptions: {
            input: {
                main: 'index.html', // Use the HTML file as the entry point
            },
            output: {
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/[name].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.css')) {
                        return 'css/[name].[ext]';
                    }
                    if (assetInfo.name?.endsWith('.jpg') || assetInfo.name?.endsWith('.png')) {
                        return 'images/[name].[ext]';
                    }
                    if (assetInfo.name?.endsWith('.eot') || assetInfo.name?.endsWith('.ttf') || assetInfo.name?.endsWith('.woff') || assetInfo.name?.endsWith('.woff2')) {
                        return 'fonts/[name].[ext]';
                    }
                    return '[name].[ext]'; // Default asset path
                },
            },
        },
    },
    plugins: [
        jsToBottomNoModule()
    ],
    publicDir: '', // Not using 'public' directory
});
