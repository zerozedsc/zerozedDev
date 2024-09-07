const { Handler } = require('@netlify/functions');
const admin = require('firebase-admin');



// Initialize Firebase Admin
const initializeFirebase = () => {
    try {
        let serviceAccount = JSON.parse(process.env.VITE_FIREBASE_SERVICE_ACCOUNT);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.VITE_FIREBASE_DATABASE_URL, // Update with your database URL if required
            });
            return JSON.stringify({ message: "success initializing Firebase Admin", serviceAccount: serviceAccount, typeServiceAccount: typeof serviceAccount, statusCode: 200 }, null, 4);
        }
        return JSON.stringify({ message: "Firebase Admin already initialized", statusCode: 200 }, null, 4);
    } catch (error) {
        return JSON.stringify({ message: `Error initializing Firebase Admin: ${error.message}`, statusCode: 500 }, null, 4);
    }
};

// Netlify function handler
const handler = async (event, context) => {
    try {
        let message = initializeFirebase(); // Ensure Firebase is initialized
        return {
            statusCode: JSON.parse(message).statusCode,
            body: JSON.stringify({ message: message, }), //check: `${typeof serviceAccount}: ${serviceAccount}` 
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to initialize Firebase Admin', details: error.message, check: `${typeof serviceAccount}: ${serviceAccount}`,
            }),
        };
    }
};

exports.handler = handler;