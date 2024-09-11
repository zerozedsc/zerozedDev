const { Handler } = require('@netlify/functions');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

const BLOG_PASSKEY = process.env.BLOG_PASSKEY
const SECRET_KEY = "Wadghlkas80SfASn20As22"; // Change to a secure key, store this in environment variables (process.env.SECRET_KEY)

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    try {
        var rawServiceAccount = process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
        var serviceAccount = JSON.parse(rawServiceAccount);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.VITE_FIREBASE_DATABASE_URL, // Update with your database URL if required
            });
            return JSON.stringify({ message: "success initializing Firebase Admin", statusCode: 200 }, null, 4);
        }
        return JSON.stringify({ message: "Firebase Admin already initialized", statusCode: 200 }, null, 4);
    } catch (error) {
        return JSON.stringify({ message: `Error initializing Firebase Admin: ${error.message}`, statusCode: 500 }, null, 4);
    }
};

// firestore collection list
const getFirestoreCollectionList = async () => {
    try {
        const collections = await admin.firestore().listCollections();
        const collectionList = collections.map((collection) => collection.id);

        return {
            message: "Successfully fetched collection list",
            statusCode: 200,
            data: collectionList,
        };

    } catch (error) {
        return {
            message: `Error fetching collection list: ${error.message}`,
            statusCode: 400,
        };
    }
};

// Get all documents in a collection
const getAllDocumentsInCollection = async (collectionName) => {
    try {
        // NOTE: WHEN ADDING NEW MONTH TO THE FIRESTORE, IT WILL BE AUTOMATICALLY BEING IN TOP
        // INDEX WILL BE LAST IN FIRESTORE
        const collectionRef = admin.firestore().collection(collectionName);
        const snapshot = await collectionRef.get();

        if (snapshot.empty) {
            return { message: "No documents found", statusCode: 404 };
        }

        const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
        }));

        return {
            message: "Successfully fetched documents",
            statusCode: 200,
            data: documents
        };

    } catch (error) {
        return {
            message: `Error fetching documents: ${error.message}`,
            statusCode: 500
        };
    }
};

// blog-data main function
const getBlogData = async () => {
    try {
        const firebaseInit = JSON.parse(initializeFirebase()); // no need to parse

        if (firebaseInit.statusCode !== 200) {
            return {
                statusCode: firebaseInit.statusCode,
                body: JSON.stringify(firebaseInit),
            };
        }

        // Await the async function before processing its result
        const collectionList = await getFirestoreCollectionList();

        if (collectionList.statusCode !== 200) {
            return {
                statusCode: collectionList.statusCode,
                body: JSON.stringify(collectionList),
            };
        }

        if (!(collectionList.data.includes('blogs'))) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "No 'blogs' collection found" }),
            };
        }
        const blogCollection = collectionList.data.includes('blogs') ? 'blogs' : '';
        const documentList = blogCollection ? await getAllDocumentsInCollection(blogCollection) : { message: "Collection not found", statusCode: 404 };

        return {
            statusCode: documentList.statusCode,
            body: JSON.stringify({ message: "Success", data: documentList.data }),
        };


    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Error fetching blog data: ${error.message}` }),
        };
    }
}

// upload-blog main function
const uploadBlog = async (blogData) => {
    try {
        const firebaseInit = JSON.parse(initializeFirebase());

        if (firebaseInit.statusCode !== 200) {
            return {
                statusCode: firebaseInit.statusCode,
                body: JSON.stringify(firebaseInit),
            };
        }

        // Validate blogData and doc_name
        if (!blogData || !blogData.doc_name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing 'blogData' or 'doc_name' parameter" }),
            };
        }

        const docName = blogData.doc_name;
        const blogContent = blogData.content;
        const contentID = Number(blogData.id);  // Convert contentID to number

        if (!blogContent) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing 'content' in blogData" }),
            };
        }

        // Reference to Firestore
        const db = admin.firestore();

        // Reference to the specific document
        const docRef = db.collection('blogs').doc(docName);
        const indexRef = db.collection('blogs').doc("INDEX");
        const indexRangeTarget = `RANGE.${docName}`;
        const docSnapshot = await docRef.get();
        const indexSnapshot = await indexRef.get();

        // If the document doesn't exist, create it (empty document)
        if (!docSnapshot.exists) {
            await docRef.set({});  // Create empty document with docName
        }

        // Add the blog content as a document inside the subcollection (contentID is used as the subcollection)
        docRef.update({
            [`${contentID}`]: {
                ...blogContent,
                TIMESTAMP: admin.firestore.FieldValue.serverTimestamp(),  // Add server timestamp
            }
        });  // Ensure the document exists before adding subcollection


        // Handle INDEX document for tracking MIN/MAX of contentIDs
        if (!indexSnapshot.exists || !indexSnapshot.data().RANGE || !indexSnapshot.data().RANGE[docName]) {
            // If RANGE or docName doesn't exist in INDEX, create it with MIN and MAX set to contentID
            await indexRef.set({
                [`${indexRangeTarget}.MIN`]: contentID,
                [`${indexRangeTarget}.MAX`]: contentID,
                ID: admin.firestore.FieldValue.increment(1) // Initialize ID increment for future use
            }, { merge: true }); // Use merge to avoid overwriting other fields
        } else {
            await indexRef.update({
                [`${indexRangeTarget}.MAX`]: admin.firestore.FieldValue.increment(1),
                ID: admin.firestore.FieldValue.increment(1) // Increment the global ID for future use
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Blog uploaded successfully", postId: newBlogPost.id }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Error uploading blog: ${error.message}` }),
        };
    }
};


// Netlify function handler
const handler = async function (event, context) {
    let requestBody;
    let queryParams = {};

    // Parse query parameters if present
    if (event.queryStringParameters) {
        queryParams = event.queryStringParameters;
    }

    // Parse request body if present
    if (event.body) {
        try {
            requestBody = JSON.parse(event.body);
        } catch (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid request body" }),
            };
        }
    }

    // Determine which parameters to use
    const type = requestBody?.type || queryParams.type;
    const password = requestBody?.password || queryParams.password;
    const token = requestBody?.token || queryParams.token;
    const id = requestBody?.id || queryParams.id;
    const rcv_data = requestBody?.data || queryParams.data;

    if (!type) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing 'type' parameter" }),
        };
    }

    // Admin Authentication
    if (type === 'admin-auth') {
        // check if admin already authenticated

        if (token) {
            try {
                const decoded = jwt.verify(token, SECRET_KEY);
                if (decoded.role !== 'admin') {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({ message: "Invalid token, please sign in again" }),
                    };
                }
                else {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ message: "Authenticated" }),
                    };

                }


            } catch (error) {
                return {
                    statusCode: 403,
                    body: JSON.stringify({ message: "Invalid or expired token, please sign in again" }),
                };
            }

        }

        if (!password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing 'password' parameter" }),
            };
        }

        // Authenticate password
        if (password === BLOG_PASSKEY) {
            // Create a JWT token
            const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Authenticated", token }),
            };
        } else {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: "Access Denied, Wrong Password" }),
            };
        }
    }

    if (type === 'blog-data') {
        // console.log("Received request:", { type, token});
        if (!token) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: "Unauthorized, please sign in" }),
            };
        }

        const content = await getBlogData();
        return {
            statusCode: content.statusCode,
            body: JSON.stringify({ message: content.message, statusCode: content.statusCode, data: JSON.parse(content.body), }),
        }
    }

    if (type === 'upload-blog') {
        console.log("Received request:", { type, token, rcv_data });
        if (!token) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: "Unauthorized, please sign in" }),
            };
        }

        try {
            // Ensure blogData is valid and complete
            if (!rcv_data) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Blog data is missing" }),
                };
            }

            // Save to Firestore (or wherever the blog content is stored)
            const saveResult = await uploadBlog(rcv_data); // Implement this function

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Success", data: saveResult }),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: `Error uploading blog content: ${error.message}` }),
            };
        }

    }

    // For Generating Blog Summary
    if (type === 'blog-summary') {
        try {
            const blogSummary = await getBlogSummary(); // Implement this function
            return {
                statusCode: 200,
                body: JSON.stringify(blogSummary),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error fetching blog summary" }),
            };
        }
    }

    // For Generating Blog Detail
    if (type === 'blog-detail' && id) {
        try {
            const blogDetail = await getBlogDetail(id); // Implement this function
            return {
                statusCode: 200,
                body: JSON.stringify(blogDetail),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error fetching blog detail" }),
            };
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request for type: " + type }),
    };
};

// Mock functions for Firebase interaction (implement these)
async function getBlogSummary() {
    // Replace with actual Firebase Realtime Database logic
    return { summary: "Blog summary data" };
}

async function getBlogDetail(id) {
    // Replace with actual Firebase Realtime Database logic
    return { detail: `Blog detail for ID ${id}` };
}


exports.handler = handler;
