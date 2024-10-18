import express from "express";
import cors from "cors";
import session from "express-session";
import { AuthenticateUser } from "./middleware/auth.middleware.js";
import AnimeRouter from "./routes/anime.route.js";
import UserRouter from "./routes/user.route.js";
import SocialsRouter from "./routes/socials.route.js";
import passport from "passport";
import MongoStore from "connect-mongo";
import "./auth.js";



const App = express();


App.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN
  })
);
App.use(express.static("public"));
App.use(express.json({ limit: "16kb" }));
App.use(
  express.urlencoded({
    extended: true,
    limit: "16kb"
  })
);

App.set("trust proxy", 1);
App.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `${process.env.DB_URI}/${process.env.DB_NAME}`
    }),
    cookie: {
      httpOnly:true,
      secure: process.env.NODE_ENV === "productionl",
      maxAge: 86400000
    }
  })
);
App.use(passport.initialize());
App.use(passport.session());


App.get("/", AuthenticateUser, (req, res) => {
  res.send("hello"+req.user.username);
});


App.use("/auth",UserRouter)
App.use("/anime", AnimeRouter);
App.use("/socials",SocialsRouter)



export default App;
