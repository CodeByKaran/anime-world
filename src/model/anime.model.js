import mongoose,{Schema} from "mongoose";


const animeSchema = new mongoose.Schema({
  postedBy: {
    type: String,
    required: true,
  },
  animeName: {
    type: String,
    required: true,
    trim: true,
  },
  animeDescription:{
     type: String,
     required: true,
     trim: true,
  },
  animeGenere: {
    type: [String], // Specify type for array items
    required: true,
    default: ["anime"],
  },
  animePhotos: {
    type: [String],
  },
  imdbRating:{
     type:String,
  },
}, {
  timestamps: true,
});



export const Anime = new mongoose.model("Anime",animeSchema)