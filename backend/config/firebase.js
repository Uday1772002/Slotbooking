const admin = require("firebase-admin");

const initializeFirebase = () => {
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error(
      "FIREBASE_PROJECT_ID is not defined in environment variables"
    );
  }

  // Initializing Firebase Admin
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };

  console.log(
    "Initializing Firebase with project:",
    process.env.FIREBASE_PROJECT_ID
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

module.exports = { admin, initializeFirebase };
