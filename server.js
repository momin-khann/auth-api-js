import connectDB from "./db/connectDB.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 8001;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
