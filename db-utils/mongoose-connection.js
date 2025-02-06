import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

const hostUrl = "127.0.0.1:27017";
const dbName = "password-reset-task";
const localUrl = `mongodb://${hostUrl}/${dbName}`

const cloudDbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}`

export const connectToMongoose = async () => {
    try {
        // await mongoose.connect(localUrl); // Connected to Mongoose
        await mongoose.connect(cloudDbUrl); // Connected to Mongoose
        console.log("Conected to mongoose")
    } catch (error) {
        console.log("Error in connecting to Mongoose", error);
        process.exit(1)
    }
}