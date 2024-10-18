import {ApiError} from "../lib/ApiError.js"


const AuthenticateUser = async (req, res, next) => {
  const session = req.user;
  console.log(session);
  if (!session) {
    return res.status(401).json(
      new ApiError("unauthoruzed access")
    );
  }
  next();
};



export { AuthenticateUser };
