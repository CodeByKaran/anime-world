import { User } from "../model/user.model.js";
import { Anime } from "../model/anime.model.js";
import mongoose from "mongoose"


class LocalReturn {
  constructor(
    isModified = false,
    isExists = false,
    isCreated = false,
    message = "",
    data = {}
  ) {
    this.isModified = isModified;
    this.isExists = isExists;
    this.isCreated = isCreated;
    this.message = message;
    this.data = data;
  }
}

const createUser = async (gid, email, username, avatar) => {
  try {
    const user = await User.create({
      gid,
      email,
      username,
      avatar
    });
    if (!user) {
      return new LocalReturn(false, false, false, "User not created");
    }
    user.save();
    return new LocalReturn(false, false, true, "User created successfully!");
  } catch (e) {
    console.log(e);
    throw new Error("Error creating user: " + e.message);
  }
};

const checkIsUserExists = async gid => {
  try {
    const user = await User.findOne({
      gid
    });
    if (!user) {
      return new LocalReturn(false, false, false, "User does not exist");
    }
    return new LocalReturn(false, true, false, "User already exists");
  } catch (e) {
    console.log(e);
    throw new Error("Error checking user existence: " + e.message);
  }
};

const isAnimeExists = async animeId => {
  try {
    const anime = await Anime.findById(animeId);

    if (!anime) {
      return new LocalReturn(
        false,
        false,
        false,
        "anime not found with this id"
      );
    }

    return new LocalReturn(
      true,
      true,
      false,
      "anime modified successfully",
      anime
    );
  } catch (e) {
    console.log(e);
    throw new Error("Error finding anime : " + e.message);
  }
};

const updateAnimeWithAnimeId = async (animeId, updateObj) => {
  try {
    const isUpdated = await Anime.updateOne(
      { _id: new mongoose.Types.ObjectId(animeId), },
      { $set: updateObj }
    );

    console.log("Update Anime Response:", isUpdated);

    const isModified = isUpdated.modifiedCount > 0;
    
    if(!isModified){
       return new LocalReturn(false, false, false, "Anime updated failed", isUpdated);
    }

    return new LocalReturn(true, false, false, "Anime updated successfully", isUpdated);
  } catch (e) {
    console.log("Error while modifying anime", e);
    throw new Error("Error modifying anime: " + e.message);
  }
};



export {
   createUser, 
   checkIsUserExists, 
   isAnimeExists,
   updateAnimeWithAnimeId,
};
