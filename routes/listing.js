//MVC framework

// routes hmlog path define ke liye use krte hi ki konse konsa function kaam krega
// aur jo bhi us routes me kaam ho rha hi vo controllers me define hoga

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
//multer package is used for multipart/form.data(uploading files)

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
//it will define the path where the file will be uploaded
const upload = multer({ storage }); //ab ye upload storage me hoga

//upload.single('avatar')
//here it is a middleware to handle the file upload and store it in the uploads folder and the name of the file will be avatar

router
  .route("/")
  //index route
  .get(wrapAsync(listingController.index))
  //create route
  .post(
    isLoggedIn,
    upload.single("listing[image]"), //image ke request ko requestAnimationFrame.file me le aayega
    validateListing,
    wrapAsync(listingController.createListing)
  );
 //here files data will stored in the created folder i.e. upload


//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  //show route
  .get(wrapAsync(listingController.showListing))
  //edit route
  .put(
    isLoggedIn,
    isOwner,   //validate ke upr hona chahiye upload wala
    upload.single("listing[image]"), //image ke request ko requestAnimationFrame.file me le aayega
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  //delete route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// //index route
// router.get("/", wrapAsync(listingController.index));

//new route
// router.get("/new", isLoggedIn, listingController.renderNewForm);

// //show route
// router.get("/:id", wrapAsync(listingController.showListing));

// //create route
// router.post(
//   "/",
//   validateListing,
//   isLoggedIn,
//   wrapAsync(listingController.createListing)
// );

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// //update route
// router.put(
//   "/:id",
//   isLoggedIn,
//   isOwner,
//   validateListing,
//   wrapAsync(listingController.updateListing)
// );

// //delete route
// router.delete(
//   "/:id",
//   isLoggedIn,
//   isOwner,
//   wrapAsync(listingController.destroyListing)
// );

module.exports = router; //here now router is a object
