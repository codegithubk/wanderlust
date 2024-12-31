const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapasync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");

//signup route
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

//signup -->jaise hi sign up ho waie login ho jaye
//passport.authenticate() invokes req.login() automatically
//this function is primarily used when sign up, during which req.login() can be invoked to autmatically log in the newly registered user
//req.login() --> se jo bhi sign up krega usko automatically log in kra dega
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      let newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          //error in login
          return next(err);
        }
        req.flash("success", "welcome to wanderlust!");
        res.redirect("listings");
      });
    } catch (err) {
      //already existing username se new signup kr rhe hi
      req.flash("error", err.message);
      res.redirect("signup");
    }
  })
);

//login route
router.get("/login",(req, res) => {
  res.render("users/login.ejs");
});

//hamara passport user ko jaise authenticate krega usase just pehle redirect url ko local ke andr save krna hoga
//(strategy , jb user ko nah ho to kaha redirect krna hi)
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    //here the old session will be deleted like it will delete redirecturl so to solve this problem we should use local
    failureRedirect: "/login",
    failureFlash: true,
  }), //passport login krwa rha hi user ko
  wrapAsync(async (req, res) => {
    req.flash("success", "welcome back to wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  })
);
//user ko authenticate krna mtlb ye user pehle se hai ya nhi ye kaam passport krke dega (it does its work through middleware)

//logout route
router.get("/logout", (req, res) => {
  //takes callback itself as a parameter  --->jaise user logout ho jaye uske immediate baad kya hona chahiye vo parameter me likhte hi
  req.logout((err) => {
    if (err) {
      return next(err); //if error is generated during logout it will store in err
    }
    req.flash("success", "you have logged out!");
    res.redirect("/listings");
  });
});

//req.user information store rkhta hi user ka with the help of passport

module.exports = router;
