// global.d.ts
import mongoose from "mongoose";

declare global {
  // Extend the NodeJS global object
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      };
    }
  }

  // Add the property directly on globalThis for newer TS versions
  let mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}
