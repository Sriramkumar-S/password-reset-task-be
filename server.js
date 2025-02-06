import express from 'express';
import cors from "cors";
import { connectToMongoose } from './db-utils/mongoose-connection.js';
import { connectToDB } from './db-utils/mongoDB-connection.js';
import userRouter from './routes/users.js';
import { job } from './serverRestart.js';

const server = express();

server.use(express.json());
server.use(cors());
server.use('/users', userRouter)


const PORT = 4500;

await connectToDB();
await connectToMongoose();

// Restart Job after 14 minutes
job.start();

server.listen(PORT, () => {
    console.log("Server listening on ", PORT);
});