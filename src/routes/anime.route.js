import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  postAnime,
  modifyAnime,
  deleteAnime,
  deleteSingleAnimePhoto,
  uploadSingleAnimePhoto,
  getSingleAnime,
  getFeedsOfAnime,
  searchAnime
} from "../controllers/anime.controller.js";
import { AuthenticateUser } from "../middleware/auth.middleware.js";
import {pagination} from "../middleware/pagination.middleware.js"


const router = Router();



router.route("/post").post(
  AuthenticateUser,
  upload.fields([
    {
      name: "animePhotos",
      maxCount: 5
    }
  ]),
  postAnime
);

router.route("/modify/:animeId").put(AuthenticateUser, modifyAnime);

router.route("/delete/:animeId").delete(AuthenticateUser, deleteAnime);

router
  .route("/photo/delete/:animeId/:photoUrl")
  .delete(AuthenticateUser, deleteSingleAnimePhoto);

router.route("/photo/upload/:animeId").post(
  AuthenticateUser,
  upload.single("animePhoto"),
  uploadSingleAnimePhoto
);


router.route("/get/single").get(
 getSingleAnime
)


router.route("/get/feeds").get(
   pagination,
   getFeedsOfAnime
)


router.route("/search").get(
   pagination,
   searchAnime
)


export default router;
