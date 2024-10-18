import { createUser, checkIsUserExists } from "./lib/db.util.js";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/callback/google"
    },
    async function (accessToken, refreshToken, profile, cb) {
      const { isExists } = await checkIsUserExists(profile.id);
      if (!isExists) {
        await createUser(
          profile.id,
          profile.emails[0].value,
          profile.displayName,
          profile.photos[0].value
        );
      }
      return cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, {
    gid: user.id,
    username: user.displayName,
    avatar: user.photos[0].value
  });
});

passport.deserializeUser(function (user, cb) {
  cb(null, user);
});
