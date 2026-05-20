import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

// REGISTER USER

export const registerUser = async (name, email, password, role) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const user = userCredential.user;

  // SAVE USER DATA

  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    role,
  });

  return user;
};

// LOGIN USER

export const loginUser = async (email, password) => {
  // FIREBASE LOGIN

  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const user = userCredential.user;

  // FETCH ROLE DATA

  const userDoc = await getDoc(doc(db, "users", user.uid));

  const userData = userDoc.data();

  return userData;
};

// LOGOUT USER

export const logoutUser = async () => {
  await signOut(auth);
};
