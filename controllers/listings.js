//controller

const Listing = require("../models/listing");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');  
//mapbox-sdk ke andr bahut sari services hai un service me hm geocoding use krenge



//index route
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

//new route
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

//show route
module.exports.showListing = async (req, res) => {
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
};

//create route
module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
 // console.log(url, filename);
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created! ");
  res.redirect("/listings");
};

//edit route
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    //agr deleted listing ka link ho aur usase access krna chah rhe ho tb ye case chalega
    req.flash("error", "Listing you requested for doesn't exits! ");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250") //changes in image using the help of cloudinary url
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

//update listing
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, req.body.listing);  //other than file will come here

  if(typeof req.file!== "undefined"){
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image = { url, filename };
  await listing.save();
  }

  req.flash("success", " Listing Updated! ");
  res.redirect(`/listings/${id}`);
};

//delete route
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "New Listing Created! ");
  req.flash("error", "Listing Deleted! ");
  //  console.log(deletedListing);
  res.redirect("/listings");
};
