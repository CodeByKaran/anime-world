import mongoose,{Schema} from "mongoose";


const userSchema = new mongoose.Schema({
  gid: {
    type: String,
    required: [true, "gid is required"],
  },
  email:{
     type:String,
     required:[true,"email is required"]
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String, // Corrected type
  },
}, {
  timestamps: true,
});


export const User = new mongoose.model("User",userSchema)