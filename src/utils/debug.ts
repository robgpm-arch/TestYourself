// Debug utilities for Firebase operations
// Add this to your browser console for testing

declare global {
  interface Window {
    __tryDelete: (collection: string, id: string) => Promise<void>;
    __testAdminPermissions: () => Promise<void>;
  }
}

// Test delete function - paste this in browser console
window.__tryDelete = async (collection: string, id: string) => {
  try {
    // @ts-ignore - Dynamic import for debugging
    const appMod = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js");
    // @ts-ignore - Dynamic import for debugging
    const fsMod = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");

    // You'll need to initialize Firebase app here with your config
    // const app = appMod.initializeApp(yourFirebaseConfig);
    // const db = fsMod.getFirestore(app);

    console.log("Delete test function loaded. Initialize Firebase app first.");
    console.log("Usage: __tryDelete('collectionName', 'documentId')");
  } catch (error) {
    console.error("Failed to load Firebase modules:", error);
  }
};

// Test admin permissions
window.__testAdminPermissions = async () => {
  try {
    // @ts-ignore - Dynamic import for debugging
    const authMod = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js");
    const user = authMod.getAuth().currentUser;

    if (!user) {
      console.log("No authenticated user");
      return;
    }

    const tokenResult = await user.getIdTokenResult();
    console.log("Current user claims:", tokenResult.claims);
    console.log("Is admin:", Boolean(tokenResult.claims.admin));

    // Force token refresh
    await user.getIdToken(true);
    const refreshedToken = await user.getIdTokenResult();
    console.log("Refreshed claims:", refreshedToken.claims);
  } catch (error) {
    console.error("Failed to check admin permissions:", error);
  }
};

export {};