import { WatchLater } from "../model/socials.model.js";
import { ApiError } from "../lib/ApiError.js";
import { ApiResponse } from "../lib/ApiResponse.js";

const saveToWatchLater = async (req, res) => {
  try {
    const userId = req?.user?.gid;

    const { animeId } = req.body;

    if (!animeId) {
      return res.status(404).json(new ApiError("anime id is required", false));
    }

    const saved = await new WatchLater({
      animeId,
      targetUser: userId
    });

    await saved.save();

    return res
      .status(201)
      .json(new ApiResponse("saved for watch later", saved, true));
  } catch (e) {
    console.log(e);
    throw new Error("error while saving for watch later" + e.message);
  }
};

const removeFromWatchLater = async (req, res) => {
  try {
    const userId = req.user.gid;

    const animeId = req.body;

    if (!animeId) {
      return res.status(404).json(new ApiError("anime id is required", false));
    }

    const deleted = await WatchLater.findOneAndDelete({
      animeId,
      targetUser: userId
    });

    console.log(deleted);

    if (!deleted) {
      return res
        .status(400)
        .json(new ApiError("document not found or mismatched!", false));
    }

    return res
      .status(200)
      .json(new ApiResponse("removed successfully", deleted, true));
  } catch (e) {
    console.log(e);
    throw new Error("error while removing for watch later" + e.message);
  }
};

const getSavedToWatchLater = async (req, res) => {
  try {
    const { page, pageSize, skip } = req.pagination;
    const targetUser = req.user._id;
    
    const results = await WatchLater.aggregate([
      {
        $facet: {
          metadata: [
            {
              $match: { targetUser: mongoose.Types.ObjectId(targetUser) }
            },
            {
              $count: "totalDocument"
            }
          ],
          data: [
            {
              $match: { targetUser: mongoose.Types.ObjectId(targetUser) }
            },
            {
              $lookup: {
                from: "users",
                localField: "targetUser",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $lookup: {
                from: "animes",
                localField: "animeId",
                foreignField: "_id",
                as: "anime"
              }
            },
            {
              $unwind: "$user"
            },
            {
              $unwind: "$anime"
            },
            {
              $project: {
                _id: "$anime._id",
                animeName: "$anime.animeName",
                animePhotos: "$anime.animePhotos",
                animeDescription: "$anime.animeDescription",
                animeGenere: "$anime.animeGenere",
                imdbRating: "$anime.imdbRating",
                timestamps: "$anime.timestamps",
                user: {
                  _id: "$user._id",
                  gid: "$user.gid",
                  username: "$user.username",
                  avatar: "$user.avatar"
                }
              }
            },
            {
              $skip: skip
            },
            {
              $limit: pageSize
            }
          ]
        }
      },
      {
        $addFields: {
          totalDocument: { $arrayElemAt: ["$metadata.totalDocument.totalDocument", 0] }
        }
      },
      {
        $project: {
          totalDocument: 1,
          data: 1
        }
      }
    ]);
    
    const animes = results[0].data;
    const totalDocument = results[0].totalDocument || 0; 
    
    return res.status(200).json(
      new ApiResponse("Fetched successfully", {
        animes,
        page,
        pageSize,
        totalAnime: totalDocument
      }, true)
    );
  } catch (e) {
    console.log("Error while getting saved watch laters", e);
    throw new Error("Internal server error: " + e.message);
  }
};

export { getSavedToWatchLater };


export { saveToWatchLater, removeFromWatchLater };
