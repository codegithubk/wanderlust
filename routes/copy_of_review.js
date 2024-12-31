//restructing the review

const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js"); //joi for listingschema  // joi for reviewSchema
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

//we will here change our path by adding aditional dot(.)

//NOTE:- agr hamre parent router ke pass kuch params hi jo use ho sakte hi to us time router banate wqt hume hamesa mergeparams use krna chahiye

// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     if (error) {
//       let errMsg = error.details.map((el) => el.message).join(",");
//       throw new ExpressError(400, errMsg);
//     } else {
//       next();
//     }
//   };

//Reviews
//post route  //review ko humesa listings ke sath access kiya jayega
//(this is known as parent route)
//in here common part is /listings/:id/reviews which we will replace it with '/'
router.post(
  "/",
  isLoggedIn,
  validateReview, //pass as a middleware
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Added! ");
    res.redirect(`/listings/${listing._id}`);
  })
);

//delete review route  (here /:reviewId is the child)
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //$pull is used to remove the specified condition from array
    await Review.findByIdAndDelete(reviewId);
    req.flash("error", "Review Deleted! ");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
