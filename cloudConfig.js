const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//kisi cheese ko configure krna mtlb hota hai jorna to hm abhi
//backend ko cloudinary se jor rhe hi
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,  //.env ke andr jo variable hai unhe hm koi bhi naam de sakte hi but yaha ke variable ko same aise hi likhna hi
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

//storage in the sense jaise google drive pe ek folder bna diye jiske andr files ko upload krte rhenge
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
     params: {
      folder: 'wanderlust_DEV',
      allowed_formats: ["png", "jpg" ,"jpeg" ], // supports promises as well
      //public_id: (req, file) => 'computed-filename-using-request',
    },
  });

  module.exports = { cloudinary, storage };

  // jo bhi url/link hai vo req.file ke  andr hai aur use mongo ke andr save krna hoga