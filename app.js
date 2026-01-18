const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayscape";

// -------------------- DB CONNECTION --------------------
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// -------------------- APP CONFIG --------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// -------------------- ROOT --------------------
app.get("/", (req, res) => {
  res.send("Hi, I am root!");
});

// ======================================================
// ===================== LISTING ROUTES =================
// ======================================================

// INDEX ROUTE
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// NEW ROUTE (FORM)
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE ROUTE
app.post("/listings", async (req, res) => {
  if (!req.body.listing.image.url) {
    delete req.body.listing.image.url;
  }

  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});

// EDIT ROUTE (FORM)  ✅ MUST BE BEFORE SHOW
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

// UPDATE ROUTE
app.put("/listings/:id", async (req, res) => {
  if (!req.body.listing.image.url) {
    delete req.body.listing.image.url;
  }

  await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
  res.redirect(`/listings/${req.params.id}`);
});

// SHOW ROUTE  ❗ ALWAYS LAST
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

// DELETE ROUTE
app.delete("/listings/:id", async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect("/listings");
});

// -------------------- SERVER --------------------
app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
