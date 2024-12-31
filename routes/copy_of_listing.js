//restructring the listing
// ExpressError.router isiliye use krte hai kyuki hamra main files bahut jyada
// bloated ho jata hi and bas usko hmlog naya folder banake har models ke liye new seprate files banake uska work main file se new file
// me daal denge jisase code same work krega but hmara main file bloated nhi rhega

//related route ko pehchaneane ke liye hmlog uska initial route points dekh sakte hi(/user)
//hamare router ke pass bhi sare method hote hi jo aap ke pass hote hi(get,post,put,delete,update,use etc)

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("../schema.js"); //joi for listingschema  // joi for reviewSchema
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


/**
 * Middleware to validate the listing schema.
 * It takes the request body and uses Joi to validate it.
 * If the validation fails, it throws an ExpressError with status code 400.
 * If the validation succeeds, it calls the next middleware.
 */
//middleware
// const validateListing = (req, res, next) => {
//   let { error } = listingSchema.validate(req.body);
//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   } else {
//     next();
//   }
// };


//index route
//yaha sare me sabse aage /listing laga DOMPointReadOnly
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);



//new route ->if it will come below show route then there will be an error
//because it will consider new as id and search for that in database
router.get("/new", isLoggedIn, (req, res) => {
  console.log(req.user); //jaise hi user login krta hi to req ke pass user ki information aa jati hi jo triggger krta hi authentication ko
  // if (!req.isAuthenticated()) {
  //   req.flash("error", "You must be logged in to create a listing");
  //   return res.redirect("/login");
  // }
  res.render("listings/new.ejs");
});

//jaise jaise hmlog server restart krenge waise hi hmlog ko login krna padega

//show route
//   router.get(
//     "/listings/:id",
//     wrapAsync(async (req, res) => {
//       let { id } = req.params;
//       const listing = await Listing.findById(id).populate("reviews");
//       res.render("listings/show.ejs", { listing });
//     })
//   );
//show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params; //nested populate
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listing) {
      //agr deleted listing ka link ho aur usase access krna chah rhe ho tb ye case chalega
      req.flash("error", "Listing you requested for doesn't exits! ");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);

//create route

router.post(
  "/",
  validateListing,
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created! ");
    res.redirect("/listings");
  })
);

// router.post(
//     "/",
//     validateListing, //(to validate)joi(when we create or edit or anything to fill up
//     //  it uses (it ensures that without filling the the form which is required u cant even move forward even from the hopscoth server)

//     wrapAsync(async (req, res, next) => {
//       // let {title, description, price, location, country, image} = req.body;
//       // let listing = req.body.listing;
//       // try{
//       // if(!req.body.listing){
//       //     throw new ExpressError(400, "send valid data for listing");
//       // }
//       const newListing = new Listing(req.body.listing);
//       // if(!newListing.title){
//       //     throw new ExpressError(400, "title is missing");
//       // }
//       //  -------------->
//       //   let result = listingSchema.validate(req.body);
//       //   //->isme hmlog check krte hi ki joi ke andr jo constraint banaya hi schema me
//       //   //vo sara request body fullfill kr paa rhi hi

//       //   if(result.error){
//       //     throw new ExpressError(400, result.error);
//       //   }
//       //--------------->

//       // if(!newListing.description){
//       //     throw new ExpressError(400, "Description is missing");
//       // }
//       // if(!newListing.location){
//       //     throw new ExpressError(400, "location is missing");
//       // }
//       //is approach krne se bahut time lagega isiliye ----joi---- use krenge to validate our schema

//       await newListing.save();
//       res.redirect("/listings");
//       // }catch(err){
//       //     next(err);
//       // }
//     })
//   );

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      //agr deleted listing ka link ho aur usase access krna chah rhe ho tb ye case chalega
      req.flash("error", "Listing you requested for doesn't exits! ");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

//update route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    // if (!req.body.listing) {
    //   throw new ExpressError(400, "send valid data for listing");
    // }
    let { id } = req.params;
    // let listing = await Listing.findById(id); //to authorize the server from  external excess through link
    // if(!listing.owner._id.equals(res.locals.currUser._id)){
    //    req.flash("error", "You don't have permission to edit this listing!");  //authorization
    //    return res.redirect(`/listings/${id}`);
    //    //do return or else down operation will also execute
    // }
    //to do the same operation we will make a new middleware

    await Listing.findByIdAndUpdate(id, req.body.listing); //jaise findbyidanddelete call hoga kisi bhi listing ke liye us time vo
    //post middleware ko call kr degi jo help krega review ko bhi delete krne me

    req.flash("success", " Listing Updated! ");

    res.redirect(`/listings/${id}`);
  })
);

//delete route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "New Listing Created! ");
    req.flash("error", "Listing Deleted! ");
    //  console.log(deletedListing);
    res.redirect("/listings");
  })
);

module.exports = router; //here now router is a object
