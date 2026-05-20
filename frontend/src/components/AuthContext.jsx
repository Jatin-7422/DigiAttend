import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase"; // Verify this points to your firebase file correctly
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to live Firebase authentication state shifts
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch additional role data from Firestore users collection
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          if (userDoc.exists()) {
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userDoc.data(),
            });
          } else {
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            });
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error building profile context:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false); // Make sure loading completes no matter what!
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume the auth values across components
export const useAuth = () => useContext(AuthContext);
