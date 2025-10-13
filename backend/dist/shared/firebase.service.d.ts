import * as admin from 'firebase-admin';
export declare class FirebaseService {
    private ensureInitialized;
    firestore(): admin.firestore.Firestore;
    auth(): import("firebase-admin/lib/auth/auth").Auth;
    database(): import("firebase-admin/lib/database/database").Database;
}
