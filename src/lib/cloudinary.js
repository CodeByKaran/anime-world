import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const options = {
  folder: "anime-world",
  resource_type: "image",
  quality_analysis: true,
  colors: true,
  auto_tagging: 0.5 // Set auto_tagging to a valid number
};

const getOptimizeUrl = async publicId => {
  const optimizeUrl = cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto"
  });
  return optimizeUrl;
};

const getPublicId = async (photoUrl)=>{
   return photoUrl.split('/').pop().split('.')[0];
}

const uploadImage = async imagePath => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, options);
    fs.unlinkSync(imagePath);
    return getOptimizeUrl(result.public_id);
  } catch (e) {
    fs.unlinkSync(imagePath);
    console.error(e);
    return false;
  }
};

const uploadMultipleAssetsOnCloudinary = async images => {
  try {
    let uploadedImages = [];
    for (const image of images) {
      const uploadedImageUrl = await uploadImage(image.path);
      if (uploadedImageUrl) {
        uploadedImages.push(uploadedImageUrl);
      } else {
        throw new Error("Image upload failed.");
      }
    }
    return uploadedImages;
  } catch (e) {
    console.error(e);
    return false;
  }
};


const deleteImage =async(photoUrl)=>{
   try {
      const photoId = getPublicId(photoUrl)
      const result = await cloudinary.uploader.destroy(photoId,{resource_type:"image"})
      console.log("delete rrs:",result);
      if(!result.result === "ok"){
         return false;
      }
      return true;
   } catch (e) {
      throw new Error(e)
   }
}


export { 
 uploadImage,uploadMultipleAssetsOnCloudinary,
 deleteImage
};
