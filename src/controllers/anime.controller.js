import { Anime } from "../model/anime.model.js";
import { ApiError } from "../lib/ApiError.js";
import { ApiResponse } from "../lib/ApiResponse.js";
import {
  uploadMultipleAssetsOnCloudinary,
  deleteImage
} from "../lib/cloudinary.js";
import { isAnimeExists, updateAnimeWithAnimeId } from "../lib/db.util.js";
import mongoose from "mongoose";
import axios from "axios";

const S_GID = "105456643103564035558";

const getAnimeInfo = async animeName => {
  try {
    const response = await axios.get(
      `${process.env.OMDB_BASE_API}?t=${animeName}&apikey=${process.env.OMDB_APIKEY}`
    );
    if (response.data.Response == "False") {
      return false;
    }
    return response.data;
  } catch (e) {
    console.log("error while getting info", e);
    return false;
  }
};

const postAnime = async (req, res) => {
  try {
    const usersession = req?.user;
    const { animeName, animeDescription, animeGenere } = req.body;

    if (!animeName) {
      return res
        .status(400)
        .json(new ApiError("Some fields are missing", false));
    }

    const animeInfo = await getAnimeInfo(animeName);

    if (!animeInfo) {
      return res
        .status(404)
        .json(
          new ApiError("there is no anime present according to the name", false)
        );
    }

    if (!animeInfo.Genre.includes("Animation")) {
      return res
        .status(401)
        .json(new ApiError("this is not Animation or anime", false));
    }

    const multerPhotos = req.files["animePhotos"];

    if (!multerPhotos || multerPhotos.length === 0) {
      return res
        .status(400)
        .json(new ApiError("No photos were uploaded", false));
    }

    const animePhotos = await uploadMultipleAssetsOnCloudinary(multerPhotos);

    if (!animePhotos) {
      return res
        .status(500)
        .json(new ApiError("Error while uploading images", false));
    }

    const newAnime = new Anime({
      postedBy: usersession.gid,
      animeName,
      animeDescription: animeDescription || animeInfo.Plot,
      animeGenere: animeGenere || animeInfo.Genre,
      animePhotos,
      imdbRating: animeInfo.imdbRating
    });

    await newAnime.save();

    return res
      .status(200)
      .json(new ApiResponse("Thanks for uploading anime", null, true));
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json(new ApiError("Error while posting anime", false));
  }
};

const modifyAnime = async (req, res) => {
  try {
    const usersession = req?.user;
    const { animeId } = req.params;

    if (!animeId) {
      return res
        .status(402)
        .json(new ApiError("anime id is not defined", false));
    }

    const { isExists, data: anime } = await isAnimeExists(animeId);

    if (!isExists) {
      return res.status(404).json(new ApiError(message, false));
    }

    if (anime.postedBy !== usersession.gid) {
      return res.status(401).json(new ApiError("unauthorize access"));
    }

    const { isModified, message } = await updateAnimeWithAnimeId(
      animeId,
      req.body
    );

    if (!isModified) {
      return res.status(500).json(new ApiError(message, false));
    }

    return res.status(200).json(new ApiResponse(message, null, true));
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json(new ApiError("internal server error occured", false));
  }
};

const uploadSingleAnimePhoto = async (req, res) => {
  try {
    const { animeId } = req.params;

    if (!animeId) {
      return res
        .status(400)
        .json(new ApiResponse("animeId is required", [], false));
    }

    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res
        .status(404)
        .json(new ApiResponse("anime not found", null, false));
    }

    if (anime.postedBy !== req?.user?.gid) {
      return res.status(401).json(new ApiError("unauthorize access"));
    }

    if (!req.file) {
      return res
        .status(400)
        .json(new ApiResponse("No file uploaded", null, false));
    }

    if (anime.animePhotos.length >= 5) {
      return res
        .status(400)
        .json(
          new ApiResponse("Maximum number of photos (5) reached", null, false)
        );
    }

    const uploadedImageUrl = await uploadImage(req.file.path);
    if (!uploadedImageUrl) {
      return res
        .status(500)
        .json(
          new ApiResponse("Image upload to Cloudinary failed", null, false)
        );
    }

    anime.animePhotos.push(uploadedImageUrl);
    await anime.save();

    res
      .status(200)
      .json(
        new ApiResponse("Photo uploaded successfully", uploadedImageUrl, true)
      );
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json(
        new ApiResponse(
          "Internal server error while uploading photo",
          null,
          false
        )
      );
  }
};

const deleteSingleAnimePhoto = async (req, res) => {
  try {
    const { animeId } = req.params;
    const { photoUrl } = req.body;

    if (!animeId || !photoUrl) {
      return res
        .status(400)
        .json(new ApiResponse("animeId and photoUrl are required", [], false));
    }

    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json(new ApiError("anime not found", false));
    }

    if (anime.postedBy !== req?.user?.gid) {
      return res.status(401).json(new ApiError("unauthorize access"));
    }

    const photoIndex = anime.animePhotos.indexOf(photoUrl);
    if (photoIndex === -1) {
      return res
        .status(404)
        .json(new ApiError("photo not found in anime", false));
    }

    const isDeleted = await deleteImage(photoUrl);

    if (!isDeleted) {
      return res
        .status(500)
        .json(new ApiError("photo deletion failed on Cloudinary", false));
    }

    anime.animePhotos.splice(photoIndex, 1);

    await anime.save();

    res
      .status(200)
      .json(new ApiResponse("photo deleted successfully", null, true));
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json(new ApiError("internal server error while deleting photo", false));
  }
};

const deleteAnime = async (req, res) => {
  try {
    const { animeId } = req.params;

    if (!animeId) {
      throw new Error("anime id is required");
    }

    const anime = await Anime.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(animeId)
    });

    if (!anime) {
      return res.status(404).json(new ApiError("anime not found", false));
    }

    return res
      .status(200)
      .json(new ApiResponse("anime deleted successfully", anime, true));
  } catch (e) {
    console.log(e);
    return res.status(500).json(new ApiError("internal server occured", false));
  }
};

const getSingleAnime = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(404).json(new ApiError("id query is required", false));
    }

    const anime = await Anime.findById(id);

    if (!anime) {
      return res.status(404).json(new ApiError("anime not found", false));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          "anime fetched",
          { anime, userPost: anime.postedBy === req?.user?.gid },
          true
        )
      );
  } catch (e) {
    console.log("error while getting anime", e);
    throw new Error(e);
  }
};

const getFeedsOfAnime = async (req, res) => {
  try {
    const { page, pageSize, skip } = req.pagination;

    const feedData = await Anime.aggregate([
      {
        $facet: {
          metadata: [{ $count: "totalDocuments" }],
          data: [
            { $match: {} },
            {
              $lookup: {
                from: "users",
                localField: "postedBy",
                foreignField: "gid",
                as: "postbyuser"
              }
            },
            { $unwind: "$postbyuser" },
            {
              $project: {
                _id: 1,
                animeName: 1,
                animePhotos: 1,
                animeDescription: 1,
                animeGenere: 1,
                imdbRating: 1,
                timestamps: 1,
                user: {
                  _id: "$postbyuser._id",
                  gid: "$postbyuser.gid",
                  username: "$postbyuser.username",
                  avatar: "$postbyuser.avatar"
                }
              }
            },
            { $skip: skip },
            { $limit: pageSize },
            {
              $sort: {
                timestamps: -1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          totalDocuments: { $arrayElemAt: ["$metadata.totalDocuments", 0] }
        }
      },
      {
        $project: {
          data: 1,
          totalDocuments: 1
        }
      }
    ]);

    const totalDocuments = feedData[0].totalDocuments;
    const feeds = feedData[0].data;

    return res.status(200).json(
      new ApiResponse(
        "feeds fetched",
        {
          feeds,
          page,
          pageSize,
          totalFeeds: totalDocuments
        },
        true
      )
    );
  } catch (e) {
    console.log("error while getting feeds", e);
    throw new Error("error while getting feeds");
  }
};

const searchAnime = async (req, res) => {
  try {
    const { animeName, imdbRating, animeGenere } = req.query;

    if (imdbRating > 9.5) {
      return res
        .status(401)
        .json(new ApiError("imdbRating must be less than 9.5", false));
    }

    const { page, pageSize, skip } = req.pagination;

    let filter = {};

    if (animeName) {
      filter.animeName = { $regex: animeName, $options: "i" };
      const anime = await Anime.findOne(filter);
      if (anime) {
        return res.status(200).json(anime);
      } else {
        return res.status(404).json({ message: "Anime not found" });
      }
    }

    if (animeGenere && imdbRating && !animeName) {
      const rating = parseFloat(imdbRating);
      if (!isNaN(rating)) {
        filter = {
          animeGenere: { $in: [animeGenere] },
          imdbRating: { $gt: rating }
        };
      }
    }

    if (imdbRating) {
      const rating = parseFloat(imdbRating);
      if (!isNaN(rating)) {
        filter.imdbRating = {
          $gt: rating
        };
      }
    }

    if (animeGenere) {
      filter.animeGenere = { $in: [animeGenere] };
    }

    const totalResults = await Anime.countDocuments(filter);
    const animes = await Anime.find(filter).skip(skip).limit(pageSize);

    res.status(200).json({
      data: animes,
      totalResults,
      page,
      pageSize
    });
  } catch (e) {
    console.log("error while searching", e);
    res
      .status(500)
      .json({ message: "Internal server error occurred: " + e.message });
  }
};

export {
  postAnime,
  modifyAnime,
  deleteAnime,
  deleteSingleAnimePhoto,
  uploadSingleAnimePhoto,
  getSingleAnime,
  getFeedsOfAnime,
  searchAnime
};
