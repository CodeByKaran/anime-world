import { Router } from "express";
import passport from "passport"


const router = Router();

router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));

router
  .route("/callback/google")
  .get(
    passport.authenticate("google", { failureRedirect: "/auth/google" }),
    function (req, res) {
      res.redirect("/");
    }
  );
  
  
router.route('/logout').post( function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});



export default router;
