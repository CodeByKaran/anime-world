



const pagination=(req,res,next)=>{
   const page = parseInt(req.query.page,10) || 1
   const pageSize = parseInt(req.query.pageSize,10) || 10;
   const skip = (page - 1) * pageSize;
   req.pagination = {
      page,
      pageSize,
      skip
   }
   next();
}


export {
   pagination
}