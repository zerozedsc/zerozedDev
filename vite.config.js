import { defineConfig } from 'vite';
const path = require('path');
const fs = require('fs-extra');
import { minify } from 'terser';
import cssnano from 'cssnano';
import postcss from 'postcss';

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

const itemsToCopy = [
    'css',
    'fonts',
    'images',
    'js',
    'sass',
    'data',
    'tstex_modules',
    'index.html',
    'navbar.html',
    'google49a38b80c3ef29c3.html',
    'robots.txt',
    'sitemap.xml',
];

const copy2Dist = () => {
    return {
        name: 'copy-to-dist',
        closeBundle() {
            try {
                itemsToCopy.forEach(async (item) => {
                    const srcPath = path.join(rootDir, item);
                    const destPath = path.join(distDir, item);

                    if (fs.lstatSync(srcPath).isDirectory()) {
                        fs.copySync(srcPath, destPath, {
                            recursive: true,
                            filter: async (src, dest) => {
                                if (src.endsWith('.css') || src.endsWith('.js')) {
                                    const minifiedDestPath = path.join(destPath, path.basename(src));

                                    if (src.endsWith('.js')) {
                                        // Minify JS
                                        try {
                                            const data = await fs.readFile(src, 'utf8');
                                            const result = await minify(data);
                                            await fs.writeFile(minifiedDestPath, result.code);
                                        } catch (err) {
                                            console.error('Error minifying JS:', err);
                                        }
                                    } else if (src.endsWith('.css')) {
                                        // Minify CSS
                                        try {
                                            const css = await fs.readFile(src, 'utf8');
                                            const result = await postcss([cssnano()]).process(css, { from: src, to: minifiedDestPath });
                                            await fs.writeFile(minifiedDestPath, result.css);
                                        } catch (err) {
                                            console.error('Error minifying CSS:', err);
                                        }
                                    }
                                    return false; // Skip copying the original file
                                }
                                return true; // Include all other files
                            }
                        });
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
        },
    },
    build: {
        sourcemap: false,
        outDir: 'dist',
        assetsDir: '',
    },
    plugins: [
        jsToBottomNoModule(),
        copy2Dist(),
    ],
    publicDir: '',
});
