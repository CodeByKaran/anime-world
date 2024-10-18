import { Router } from "express";
import { AuthenticateUser } from "../middleware/auth.middleware.js";
import {
   saveToWatchLater,
   removeFromWatchLater
} from "../controllers/socials.controller.js"

const router = Router();


router.route("/watch-later/save").post(
   AuthenticateUser,
   saveToWatchLater
 )
 
 
router.route("/watch-later/remove").post(
   AuthenticateUser,
   removeFromWatchLater
 )
 


export default router;