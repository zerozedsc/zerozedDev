import { defineConfig } from 'vite';
const path = require('path');
const fs = require('fs-extra');

const copyFilesPlugin = (filename, distdir) => {
    return {
        name: 'copy-files',
        closeBundle() {
            const srcPath = path.resolve(__dirname, filename);
            const destPath = path.resolve(__dirname, distdir, path.basename(filename));

            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`${filename} copied to ${distdir}`);
            } else {
                console.error(`File not found: ${srcPath}`);
            }
        }
    };
};

const rootDir = path.resolve(__dirname);
const distDir = path.join(rootDir, 'dist');

// List of folders and files to copy
const itemsToCopy = [
    'css',
    'fonts',
    'images',
    'js',
    'sass',
    'tstex_modules',
    'index.html',
    'navbar.html'
];

const copy2Dist = () => {
    return {
        name: 'copy-to-dist',
        closeBundle() {
            try {
                itemsToCopy.forEach(async (item) => {
                    const srcPath = path.join(rootDir, item);
                    const destPath = path.join(distDir, item);

                    // Check if the item is a directory
                    if (fs.lstatSync(srcPath).isDirectory()) {
                        fs.copySync(srcPath, destPath);
                    } else {
                        fs.copyFileSync(srcPath, destPath);
                    }
                });
                console.log('Files and folders copied successfully!');
            } catch (err) {
                console.error('Error copying files:', err);
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
            VITE_FIREBASE_SERVICE_ACCOUNT: JSON.stringify(process.env.VITE_FIREBASE_SERVICE_ACCOUNT),
        },
    },
    build: {
        // target: 'esnext',
        outDir: 'dist',
        // assetsDir: '', // Do not create an 'assets' folder in 'dist'
    },
    plugins: [
        jsToBottomNoModule(),
        copy2Dist(),
    ],
    publicDir: '', // Not using 'public' directory
});
