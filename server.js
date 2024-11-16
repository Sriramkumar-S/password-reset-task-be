import express from 'express';
import cors from "cors";
import { connectToMongoose } from './db-utils/mongoose-connection.js';
import { connectToDB } from './db-utils/mongoDB-connection.js';
import userRouter from './routes/users.js';

const server = express();

server.use(express.json());
server.use(cors());
server.use('/users', userRouter)


const PORT = 4500;

await connectToDB();
await connectToMongoose();

server.listen(PORT, () => {
    console.log("Server listening on ", PORT);
});