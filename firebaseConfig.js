// Load environment variables
require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

// Load service account key from environment variables or file
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL // Make sure this URL is in your .env file
});

// Get a Firestore instance
const db = admin.firestore();

module.exports = { db };
