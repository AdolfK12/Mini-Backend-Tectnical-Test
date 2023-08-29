const request = require("supertest");
const express = require("express");
const router = require("../routers/router");
const app = express();

app.use(express.json());
app.use("/", router);

jest.mock("../models/index");

const { Book, BorrowedBook, Member } = require("../models/index");

describe("Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /books", () => {
    it("should retrieve all books and calculate available stock", async () => {
      const mockBooks = [
        { id: 1, stock: 10, dataValues: { stock: 10 } },
        { id: 2, stock: 5, dataValues: { stock: 5 } },
      ];

      Book.findAll.mockResolvedValue(mockBooks);

      BorrowedBook.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

      const response = await request(app).get("/books");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].dataValues.availableStock).toBe(8);
      expect(response.body[1].dataValues.availableStock).toBe(4);
    });

    it("should handle errors", async () => {
      Book.findAll.mockRejectedValue(new Error("Test error"));

      const response = await request(app).get("/books");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal Server Error" });
    });
  });

  describe("POST /books/borrow/:bookCode", () => {
    it("should return 404 if member not found", async () => {
      Member.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/books/borrow/ABC123")
        .send({ memberCode: "M001" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Member not found" });
    });

    it("should return 403 if member is penalized", async () => {
      Member.findOne.mockResolvedValue({
        penalty_date: new Date(Date.now() + 86400000),
      }); // penalty date set to tomorrow

      const response = await request(app)
        .post("/books/borrow/ABC123")
        .send({ memberCode: "M001" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        message: "Member is being penalized and cannot borrow books",
      });
    });

    it("should return 400 if member has already borrowed 2 books", async () => {
      Member.findOne.mockResolvedValue({ id: 1 });
      BorrowedBook.count.mockResolvedValue(2);

      const response = await request(app)
        .post("/books/borrow/ABC123")
        .send({ memberCode: "M001" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Member has already borrowed 2 books",
      });
    });

    it("should allow a member to borrow a book successfully", async () => {
      Member.findOne.mockResolvedValue({ id: 1 });
      BorrowedBook.count.mockResolvedValue(0);
      Book.findOne.mockResolvedValue({ id: 1, stock: 5 });
      BorrowedBook.create.mockResolvedValue({});
      Book.update.mockResolvedValue({});

      const response = await request(app)
        .post("/books/borrow/ABC123")
        .send({ memberCode: "M001" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Book borrowed successfully",
      });
    });

    it("should handle unexpected errors", async () => {
      Member.findOne.mockRejectedValue(new Error("Test error"));

      const response = await request(app)
        .post("/books/borrow/ABC123")
        .send({ memberCode: "M001" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal Server Error" });
    });
  });

  describe("POST /books/return/:bookCode", () => {
    it("returns a 404 error when the member doesn't exist", async () => {
      Member.findOne.mockResolvedValue(null);
      const response = await request(app)
        .post("/books/borrow/ABC123")
        .send({ memberCode: "M001" });
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Member not found");
    });

    it("should set penalty date if book is returned after due date", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      Member.findOne.mockResolvedValue({ id: 1 });
      Book.findOne.mockResolvedValue({ id: 2, stock: 1 });
      BorrowedBook.findOne.mockResolvedValue({
        due_date: pastDate,
        update: jest.fn(),
      });

      const response = await request(app)
        .post("/books/return/ABC123")
        .send({ memberCode: "M001" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Book returned successfully" });
    });

    it("should return the book successfully", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      Member.findOne.mockResolvedValue({ id: 1 });
      Book.findOne.mockResolvedValue({ id: 2, stock: 1 });
      BorrowedBook.findOne.mockResolvedValue({
        due_date: futureDate,
        update: jest.fn(),
      });

      const response = await request(app)
        .post("/books/return/ABC123")
        .send({ memberCode: "M001" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Book returned successfully" });
    });
  });

  describe("GET /members", () => {
    it("should retrieve all members and their borrowed books count", async () => {
      const mockMembers = [
        { id: 1, dataValues: {} },
        { id: 2, dataValues: {} },
      ];

      Member.findAll.mockResolvedValue(mockMembers);
      BorrowedBook.count.mockResolvedValueOnce(1).mockResolvedValueOnce(2);

      const response = await request(app).get("/members");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].dataValues.borrowedBooksCount).toBe(1);
      expect(response.body[1].dataValues.borrowedBooksCount).toBe(2);
    });

    it("should handle errors when fetching members", async () => {
      Member.findAll.mockRejectedValue(new Error("DB Error"));

      const response = await request(app).get("/members");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal Server Error" });
    });

    it("should handle errors when fetching borrowed books count", async () => {
      const mockMembers = [{ id: 1, dataValues: {} }];

      Member.findAll.mockResolvedValue(mockMembers);
      BorrowedBook.count.mockRejectedValue(new Error("DB Count Error"));

      const response = await request(app).get("/members");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal Server Error" });
    });
  });

  describe("GET /members/:memberCode", () => {
    it("should fetch member details based on memberCode", async () => {
      const mockMember = {
        id: 1,
        code: "M001",
        name: "John Doe",
      };

      Member.findOne.mockResolvedValue(mockMember);

      const response = await request(app).get("/members/M001");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMember);
    });

    it("should return 404 when member is not found", async () => {
      Member.findOne.mockResolvedValue(null);

      const response = await request(app).get("/members/M001");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Member not found" });
    });

    it("should handle unexpected errors", async () => {
      Member.findOne.mockRejectedValue(new Error("Test error"));

      const response = await request(app).get("/members/M001");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal Server Error" });
    });
  });
});
