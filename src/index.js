import App from "./app.js";
import dotenv from "dotenv";
import { dbConnect } from "./db/dbconnect.js";

dotenv.config({
  path: "../.env"
});

dbConnect().then(res => {
  App.listen(process.env.PORT, () => {
    console.log("server listening on port", process.env.PORT);
  });
});
