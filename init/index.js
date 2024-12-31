const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
  .then(() => {
    console.log("connected to db");
    initdb();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initdb = async () => {
  await Listing.deleteMany({});
  //ye map function ye naya array banta purane me changes nhi krta hi                           //listing object ki sari properties aayegi and ek new owner add hoga jiska id fix hi
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "675e7d3f8c48483a4e81ebf3",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

//initDB();
