const express = require("express");
const ExpressError = require("../expressError");
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");
const bookUpdateSchema = require("../schemas/bookUpdateSchema.json");

const router = new express.Router();

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});


router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});


router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    if (err.code === '23505') {
      return next(new ExpressError('ISBN already exists!', 400));
    }
    return next(err);
  }
});


router.put("/:isbn", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookUpdateSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});


router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
