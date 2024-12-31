//TO ACCESS the .env file we will use package i.e. dotenv
// through this we will load the variables of .env file into process.env file

//deployement time we will use .env in different way
if(process.env.NODE_ENV != "production"){
  require("dotenv" ).config();
}
//development(.env) --> jab bna rhe and production(node_env)--> jb deploy kr dete hi

//console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
//const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");
//const { listingSchema, reviewSchema } = require("./schema.js"); //joi for listingschema  // joi for reviewSchema
//const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const MongoStore = require('connect-mongo');



//NOTE:- express router hame destructuring karane me use hota hi


//i  commented out this require thing because we dont need this thing now in this file

const listingsRouter = require("./routes/listing.js");   //all listings route
const reviewsRouter = require("./routes/review.js");   //all reviews route
const userRouter = require("./routes/user.js");

//joi is used for validation of schema


//const dbUrl = process.env.ATLASDB_URL;
      //cloud database
const dbUrl = process.env.ATLASDB_URL ;



main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });


async function main() {
  await mongoose.connect(dbUrl);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  //hmara mongodb ka database  kaha pe hoga
     mongoUrl: dbUrl,
    // encryption ke liye crypto
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60,
    //by default jb bhi hm tab firse reopen krte hi or refresh krte hi to 
    //vo baar baar update hoti hi even though there was no change
    //but we dont want it to repeatedly update if there is no change   -->solution----> touchAfter
});

//session collection ab hmare atlas me store hoga as a collection of our databse
//by default hmari session 14 days tak save rhegi  agr hmlog koi change ya update nhi krenge to
//agr 14 days tak user ne koi activity nhi kr rhi hi to use log out kr sakte hai 

store.on("error", () => {
   console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {
  store: store,   //or can be written as only (store)
  //mongo store related jo hamare session ke andr jaa rhi hi
  //**ab hamari session ki information atlas databse ke andr store hone wali hai
  //agr hm chahte ki localhost me ho to dburl ke jagah localhost wala url send krte mongourl me
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //in millisecond
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true //security purpose  (cross-scripting attack)
  }
  
};
//here expires bydefault set to null which is cokkies will never delete
//when we login to any website on browser and after shut it down and after sometime if u reopen it on same tab the
//that time u didnt need to relogin into it
//ye sara login process ka details cookies ke pass hota hi and jaise hi vo expire ho jayega waise hi tumhe relogin 
//krna padega

//root
// app.get("/", (req, res) => {
//   res.send("hi, i am the server");
// });

             //ye ek method hai jo naya mongostore create krne me kaam aata hi






app.use(session(sessionOptions));
app.use(flash());  //routes se pehle use krna hoga

app.use(passport.initialize());
app.use(passport.session()); //website ko pata hona chahiye ki user ek page se dusre page pe jaa rha hi to ye same user hai ya different
//passport ko implement krne ke liye session ki jarurat padega because kisi ek session me user ka login credential pata rhega to baar baar login ka jarurat nhi padega
passport.use(new LocalStrategy(User.authenticate()));
//passport ke andr jo new localstrategy create hua hi to us localstrategy ke through user ka login signup ye sab authenticate hona chahiye
//and ye authenticate karane ke liye User.authenticate() method use krenge
passport.serializeUser(User.serializeUser());  //user ko serialize krega--->serialize mtlb session ke andr user se related sari information ko store krega
passport.deserializeUser(User.deserializeUser()); //ek baar jb session khatam ho jayega to user ko deseriallize krna padega



app.use((req,res,next)=>{  //ye middleware locals ko define krne ke liye use kiye hi
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

// app.get("/demouser",async(req,res)=>{  //new user create krenge jo databse ke andr add krenge 
//     let fakeUser = new User({
//        email: "student@gmail.com",
//        username: delta-student,  //passport-local-mongoose se add kr diya
//     })
//     //static method to store user
//     let registeredUser = await User.register(fakeUser,"helloworld")  //fakeuser and password pass krenge (passport ke help se register )
//     res.send(registeredUser);
// })
//hashing algorithm = pbkdf2(we are implementing this hashing algo)


//validate listing method (joi)
// const validateListing = (req, res, next) => {
//   let { error } = listingSchema.validate(req.body);
//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   } else {
//     next();
//   }
// };

// const validateReview = (req, res, next) => {
//   let { error } = reviewSchema.validate(req.body);
//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   } else {
//     next();
//   }
// };


//single line for use of listing route
app.use("/listings",listingsRouter); 
//hmlog router me common part likhte hi and new files sab me common part hata dete hi
//jo bhi request aayega tb yaha jis bhi routes ke sath math hogi us file me jaake work krega
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/",userRouter);

//jab hmlog routers ke file ko require kr liye to 'use' ke help se use kr paate hi vo required ko

//here id parameter still remains in app.js and didnt go to listing or review route file
//so to solve this problem we have to merge the parent and child



// //Reviews
// //post route  //review ko humesa listings ke sath access kiya jayega
// app.post(
//   "/listings/:id/reviews",
//   validateReview,  //pass as a middleware
//   wrapAsync(async (req, res) => {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();

//     res.redirect(`/listings/${listing._id}`);
//   })
// );


// //delete review route
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
//   let { id, reviewId } = req.params;


//   await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});  //$pull is used to remove the specified condition from array
//   await Review.findByIdAndDelete(reviewId);
  
//   res.redirect(`/listings/${id}`);
// }));



// app.get("/testlisting", async(req, res) => {
//        let sampleListing = new Listing({
//            title: "my new villa",
//            description: "by the beach",
//            price: 1200,
//            location: "calangute, goa",
//            country: "india",
//          //  image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
//        })

//        await sampleListing.save();
//        console.log("saved");
//        res.send("successful testing");
// })

//here if none of the routes matches to the request of route entered
//then it will come to this route which accept all type of route
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

//error handler middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.status(statusCode).render("./Error/error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});

//agr hoppscotch ya koi server se price string me bhej de to vo ek error aayega (acceptable nhi hi)
//aur vo async error aayega

// agr hmlog hopscotch se add new kre and  waha koi key ko value na deke skip kr de jaise description then the form will still be
// submitted and ye nhi hona chahiye
//validation apply krne se theek ho sakta hi

// client side validation  -: through form
// server side validation  -:  through joi




//for rating we will use a library (starability)


//we willl not upload our .env and node module files and folder into github because .env file is our sensitive files and node modules ka koi  jarurat nhi hi kyuki package.json hoga to use kaam ho jayega 