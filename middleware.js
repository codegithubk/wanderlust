const listing = require("./models/listing");
const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
    //console.log(req);
    //console.log(req.path, "..", req.originalUrl);
    if (!req.isAuthenticated()) {
        //redirecturl save
        req.session.redirectUrl = req.originalUrl;

        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
        //as passport will not be able to delete local value
    }
    next();
}


module.exports.isOwner = async(req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash('error', 'Listing not found!');
      return res.redirect('/listings');
    }
    if(!listing.owner.equals(req.user._id)){
        req.flash("error", "You don't have permission to do that!");
        return  res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.isReviewAuthor = async(req, res, next) => {
    let { id ,reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You didn't create this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };

  module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };


//req ke pass logout object rhta hi(req.logout) jisase vo serialize deserialise se user ko delete kr dega current session se