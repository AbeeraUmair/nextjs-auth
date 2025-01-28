import mongoose from "mongoose";

const connect = async () => {
  if (mongoose.connections[0].readyState) return;

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    await mongoose.connect(mongoUri, {
   
    });
    console.log("Mongo Connection successfully established.",);
  } catch (error) {
    throw new Error(`Error connecting to Mongoose: ${error}`);
  }
};

export default connect;