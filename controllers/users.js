
const User = require("../models/user.js");



//signup
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
  }

module.exports.signup = async (req, res) => {
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
      req.flash("error", err.message);
      res.redirect("signup");
    }
  }


  //login
  module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
  }

  module.exports.login = async (req, res) => {
    req.flash("success", "welcome back to wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }


  //logout

  module.exports.logout = (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err); 
      }
      req.flash("success", "you have logged out!");
      res.redirect("/listings");
    });
  }
