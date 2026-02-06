import express from "express";
import "./config/db";
import { createEmailsTable } from "./db/init";
import "./config/redis";
import emailRoutes from "./routes/emailRoutes";
import "./workers/emailWorker";
import "dotenv/config";



const app=express();
app.use(express.json());
app.use("/api/email", emailRoutes);

createEmailsTable();

app.get("/",(req,res)=>{
    res.send("backend is running");
});


const port=process.env.PORT || 5000;



app.listen(port,()=>{
    console.log(`server is running on port ${port}`);

});
