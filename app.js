const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

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
app.get("/listings", wrapAsync (async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// NEW ROUTE (FORM)
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// CREATE ROUTE
app.post("/listings", wrapAsync (async (req, res, next) => {
    
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
    }
    
    if (!req.body.listing.image.url) {
      delete req.body.listing.image.url;
    }

    const newListing = new Listing(req.body.listing);
    await newListing.save();

    res.redirect("/listings");
}));


// EDIT ROUTE (FORM) MUST BE BEFORE SHOW
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

// UPDATE ROUTE
app.put("/listings/:id", wrapAsync(async (req, res) => {

  if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
  }

  if (!req.body.listing.image.url) {
    delete req.body.listing.image.url;
  }
  

  await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
  res.redirect(`/listings/${req.params.id}`);
}));

// SHOW ROUTE ALWAYS LAST
app.get("/listings/:id", wrapAsync (async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

// DELETE ROUTE
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect("/listings");
}));

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let {statusCode=500, message="Something went wrong!"} = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
})

// -------------------- SERVER --------------------
app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
