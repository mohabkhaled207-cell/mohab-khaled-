import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, setLogLevel } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const hasConfig = Boolean(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);

const app = hasConfig ? initializeApp(firebaseConfig) : null;

if (app) {
  try {
    setLogLevel("error");
  } catch {
    // no-op if already configured
  }
}

export const auth = app ? getAuth(app) : null;
export const db = app
  ? initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true
      },
      firebaseConfig.firestoreDatabaseId || undefined
    )
  : null;

export const firebaseReady = Boolean(app && db);