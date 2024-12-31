const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
      url: String,
      filename: String,
  },
  price: Number,
  location: String,
  country: String,
  filename: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  // category: {
  //    type: string,
  //    enum: ["mountain", "city", "arctic", "farm", "swimming pool", "Room", "Trending", "Castle", "Camping"]
  // }
});

listingSchema.post("findOneAndDelete", async (listing)=>{
    if(listing){
     await Review.deleteMany({_id: {$in: listing.reviews}})
    }
 
  })
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;


//actual backend ke andr process ho rha hai jaha cloud ke andr file save ho rha hi isiliye add krte wqt time lg rha hi 
