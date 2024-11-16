import mongodb from "mongodb";
import dotenv from 'dotenv'

dotenv.config();

const localDbUrl = "127.0.0.1:27017"
const dbName = "password-reset-task"
const cloudUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}`;

// local DB url
// export const client = new mongodb.MongoClient(`mongodb://${localDbUrl}`)

// Cloud DB url
export const client = new mongodb.MongoClient(cloudUrl)


export const db = client.db(dbName);

export const connectToDB = async () => {
    try {
        console.log("Connected to DB")
        await client.connect(); // Database connected
    } catch (error) {
        console.log("Error in connecting to DB", error);
        process.exit(1)
    }
}