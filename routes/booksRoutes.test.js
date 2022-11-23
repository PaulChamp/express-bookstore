process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

const book = {
  "isbn": "0691161518",
  "amazon_url": "http://a.co/eobPtX2",
  "author": "Matthew Lane",
  "language": "english",
  "pages": 264,
  "publisher": "Princeton University Press",
  "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
  "year": 2017
};


describe("Books Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM books");

    let b1 = await Book.create(book);

  });

  describe("GET /books", function () {
    test("can view list", async function () {
      let response = await request(app)
        .get("/books");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        books: [
          book
        ]
      });
    });
  });

  describe("GET /books/[id]", function () {
    test("can view book", async function () {
      let response = await request(app)
        .get("/books/" + book.isbn);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        book
      });
    });


    test("can't view book", async function () {
      let response = await request(app)
        .get("/books/test");

      expect(response.status).toBe(404);
    });
  });


  describe("POST /books", function () {
    test("can create book", async function () {
      const book1 = {
        "isbn": "000000",
        "amazon_url": "http://a.co/test",
        "author": "Test author",
        "language": "english",
        "pages": 100,
        "publisher": "test publisher",
        "title": "Test",
        "year": 2017
      };
      let response = await request(app)
        .post("/books")
        .send(book1);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ book: book1 });
    });

    test("can't create book", async function () {
      let response = await request(app)
        .post("/books")
        .send({
          "isbn": "",
          "amazon_url": "amazon url",
          "author": "Test author",
          "language": "english",
          "pages": 0,
          "publisher": "test publisher",
          "title": "Test",
          "year": 0
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain("instance.isbn does not meet minimum length of 1");
      expect(response.body.error.message).toContain("instance.amazon_url does not conform to the \"uri\" format");
      expect(response.body.error.message).toContain("instance.pages must be greater than or equal to 1");
      expect(response.body.error.message).toContain("instance.year must be greater than or equal to 1");

      response = await request(app)
        .post("/books")
        .send(book);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toEqual("ISBN already exists!");

    });
  });


  describe("PUT /books/[isbn]", function () {
    test("can udpate book", async function () {
      const book1 = {
        "amazon_url": "http://a.co/test",
        "author": "Test author",
        "language": "english",
        "pages": 100,
        "publisher": "Test publisher",
        "title": "Test",
        "year": 2020
      };
      let response = await request(app)
        .put("/books/0691161518")
        .send(book1);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        book: {
          "isbn": "0691161518",
          ...book1
        }
      });
    });

    test("can't create book", async function () {
      let response = await request(app)
        .put("/books/0691161518")
        .send({
          "amazon_url": "amazon url",
          "author": "Test author",
          "language": "english",
          "pages": 0,
          "publisher": "test publisher",
          "title": "Test",
          "year": 0
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain("instance.amazon_url does not conform to the \"uri\" format");
      expect(response.body.error.message).toContain("instance.pages must be greater than or equal to 1");
      expect(response.body.error.message).toContain("instance.year must be greater than or equal to 1");

      response = await request(app)
        .put("/books/test")
        .send(book);

      expect(response.status).toBe(404);

    });
  });

});

afterAll(async function () {
  await db.end();
});
