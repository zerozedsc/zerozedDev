const functions = require('@netlify/functions');
const admin = require('firebase-admin');

// Parse the service account credentials from environment variables
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin if it's not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://helmi-digital-portfolio-default-rtdb.asia-southeast1.firebasedatabase.app', // Update with your database URL if required
    });
}

exports.handler = async (event, context) => {
    // Example: Fetch some data from Firestore or perform other operations using Firebase Admin
    try {
        const message = 'Firebase Admin initialized successfully';

        // You can now interact with Firebase services, like Firestore, Auth, etc., using the Admin SDK
        return {
            statusCode: 200,
            body: JSON.stringify({ message }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to initialize Firebase Admin', details: error.message }),
        };
    }
};