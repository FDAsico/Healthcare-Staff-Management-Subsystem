import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
}));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then (() => {
    console.log("Connected!");
    app.listen(process.env.PORT || 5000, () => { 
        console.log(`Running on port ${process.env.PORT}`);
    });
}).catch(err => console.log("Connection Failed", err));