import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const copyFilesPlugin = () => {
    return {
        name: 'copy-files',
        closeBundle() {
            const srcPath = path.resolve(__dirname, 'navbar.html');
            const destPath = path.resolve(__dirname, 'dist', 'navbar.html');

            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log('navbar.html copied to dist');
            } else {
                console.error('navbar.html not found');
            }
        }
    };
};

const jsToBottomNoModule = () => {
    return {
        name: 'move-main-js-to-body',
        transformIndexHtml(html) {
            let scriptTag = html.match(/<script\s+type="module"\s+crossorigin[^>]*src="\/js\/main\.js"><\/script>/);
            if (scriptTag) {
                scriptTag = scriptTag[0];
                html = html.replace(scriptTag, '');
                html = html.replace('</body>', `${scriptTag}\n</body>`);
            }
            return html;
        }
    };
};

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
                main: 'index.html',
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
                    return '[name].[ext]';
                },
            },
        },
    },
    plugins: [
        jsToBottomNoModule(),
        copyFilesPlugin()
    ],
    publicDir: '', // Not using 'public' directory
});
