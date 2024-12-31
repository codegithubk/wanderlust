//MVC framework
//in resume we can include mvc framework used in my major project as a bullet points

const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapasync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");

const userController = require("../controllers/users.js");





router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", {  //asli me passport login krwa rha hi
  failureRedirect: "/login",
  failureFlash: true,
}), wrapAsync(userController.login));





// //signup
// //signupform render route
// router.get("/signup", userController.renderSignupForm);

// //signup aacept route
// router.post(
//   "/signup",
//   wrapAsync(userController.signup)
// );

// //login route
// router.get("/login",userController.renderLoginForm);


// router.post(
//   "/login",
//   saveRedirectUrl,
//   passport.authenticate("local", {  //asli me passport login krwa rha hi
//     failureRedirect: "/login",
//     failureFlash: true,
//   }), 
//   wrapAsync(userController.login)
// );

//logout route
router.get("/logout", userController.logout);


module.exports = router;
