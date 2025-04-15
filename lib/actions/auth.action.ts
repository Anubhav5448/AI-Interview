"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

// --- Type Definitions ---
type SignUpParams = {
  uid: string;
  name: string;
  email: string;
};

type SignInParams = {
  email: string;
  idToken: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

// --- Sign Up Function ---
export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please Sign in instead.",
      };
    }

    await db.collection("users").doc(uid).set({ name, email });

    return {
      success: true,
      message: "Account created successfully. Please Sign in.",
    };
  } catch (error: unknown) {
    console.error("Error creating a user", error);

    if (error instanceof Error && 'code' in error && error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use.",
      };
    }

    return {
      success: false,
      message: "Failed to create an account",
    };
  }
}

// --- Sign In Function ---
export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Create an account instead",
      };
    }

    await setSessionCookie(idToken);

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error) {
    console.error("Error signing in", error);
    return {
      success: false,
      message: "Failed to log into an account",
    };
  }
}

// --- Session Management ---
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

// --- User Management ---
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db.collection("users").doc(decodedClaims.uid).get();

    if (!userRecord.exists) return null;

    return {
      id: userRecord.id,
      name: userRecord.data()?.name || '',
      email: userRecord.data()?.email || '',
    };
  } catch (error) {
    console.error("Error verifying session cookie", error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}