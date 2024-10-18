import mongoose from "mongoose"


const dbConnect=async()=>{
   try {
    const dbInstance = await mongoose.connect(`${process.env.DB_URI}/${process.env.DB_NAME}`)
    console.log(`db connected successfully ${dbInstance.connections[0].host}`);
   } catch (e) {
      console.log(e);
      process.exit(1);
   }
}


export {
   dbConnect
}