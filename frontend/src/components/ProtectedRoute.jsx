import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
// 1. Import auth directly from your Firebase configuration file
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function ProtectedRoute({ children, allowedRole }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Track auth state directly on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Keep the screen clean while Firebase verifies the session token
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Not Logged In -> Send back to login root
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // NOTE: If you store the user's role in your Firestore database,
  // you can check it here. Otherwise, let them through to the children components.
  return children;
}

export default ProtectedRoute;
