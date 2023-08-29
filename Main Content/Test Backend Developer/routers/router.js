const express = require("express");
const Controller = require("../controllers/controller");
const router = express.Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve a list of books
 *     description: Get a list of all books in the library
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: A list of books
 */
router.get("/books", Controller.getAllBooks);

/**
 * @swagger
 * /books/borrow/{bookCode}:
 *   post:
 *     summary: Borrow a book
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: bookCode
 *         required: true
 *         description: Code of the book to be borrowed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberCode
 *             properties:
 *               memberCode:
 *                 type: string
 *                 description: Code of the member borrowing the book.
 *     responses:
 *       200:
 *         description: Book borrowed successfully
 *       400:
 *         description: Book is not available for borrowing or member has already borrowed 2 books
 *       403:
 *         description: Member is being penalized and cannot borrow books
 *       404:
 *         description: Member not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/books/borrow/:bookCode", Controller.borrowBook);

/**
 * @swagger
 * /books/return/{bookCode}:
 *   post:
 *     summary: Return a borrowed book
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: bookCode
 *         required: true
 *         description: Code of the book to be returned
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberCode
 *             properties:
 *               memberCode:
 *                 type: string
 *                 description: Code of the member returning the book.
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       400:
 *         description: Member hasn't borrowed this book or has already returned it
 *       404:
 *         description: Member or book not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/books/return/:bookCode", Controller.returnBook);

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Retrieve a list of members
 *     description: Get a list of all library members
 *     tags:
 *       - Members
 *     responses:
 *       200:
 *         description: A list of members
 *       500:
 *         description: Internal Server Error
 */
router.get("/members", Controller.getAllMembers);

/**
 * @swagger
 * /members/{memberCode}:
 *   get:
 *     summary: Get details of a specific member
 *     tags:
 *       - Members
 *     parameters:
 *       - in: path
 *         name: memberCode
 *         required: true
 *         description: Code of the member
 *     responses:
 *       200:
 *         description: Member details
 *       404:
 *         description: Member not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/members/:memberCode", Controller.getMemberDetails);

module.exports = router;
