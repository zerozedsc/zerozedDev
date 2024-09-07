const { Handler } = require('@netlify/functions');
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.VITE_FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin
const initializeFirebase = () => {
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.VITE_FIREBASE_DATABASE_URL, // Update with your database URL if required
            });
        }
    } catch (error) {
        throw new Error(`Error initializing Firebase Admin: ${error.message}`);
    }
};

// Netlify function handler
const handler = async (event, context) => {
    try {
        initializeFirebase(); // Ensure Firebase is initialized

        const message = 'Firebase Admin initialized successfully';

        return {
            statusCode: 200,
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