import mongoose from "mongoose";
const { Schema } = mongoose;

const watchLaterSchema = new Schema({
  animeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Anime",
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

export const WatchLater = mongoose.model("WatchLater", watchLaterSchema);
