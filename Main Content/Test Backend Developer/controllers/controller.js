const { Book, BorrowedBook, Member } = require("../models/index");

class Controller {
  static async getAllBooks(req, res) {
    try {
      const books = await Book.findAll();

      for (const element of books) {
        const borrowedBooksCount = await BorrowedBook.count({
          where: {
            Book_id: element.id,
            return_date: null,
          },
        });

        element.dataValues.availableStock = element.stock - borrowedBooksCount;
      }

      res.status(200).json(books);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async borrowBook(req, res) {
    try {
      const memberCode = req.body.memberCode;
      const bookCode = req.params.bookCode;

      const member = await Member.findOne({ where: { code: memberCode } });
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      if (member.penalty_date && new Date() <= member.penalty_date) {
        return res.status(403).json({
          message: "Member is being penalized and cannot borrow books",
        });
      }

      const borrowedBooksCount = await BorrowedBook.count({
        where: { Member_id: member.id, status: "borrowed" },
      });
      if (borrowedBooksCount >= 2) {
        return res
          .status(400)
          .json({ message: "Member has already borrowed 2 books" });
      }

      const book = await Book.findOne({ where: { code: bookCode } });
      if (!book || book.stock <= 0) {
        return res
          .status(400)
          .json({ message: "Book is not available for borrowing" });
      }

      await BorrowedBook.create({
        Member_id: member.id,
        Book_id: book.id,
        borrow_date: new Date(),
        due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: "borrowed",
      });

      await Book.update({ stock: book.stock - 1 }, { where: { id: book.id } });

      res.status(200).json({ message: "Book borrowed successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async returnBook(req, res) {
    try {
      const memberCode = req.body.memberCode;
      const bookCode = req.params.bookCode;

      const member = await Member.findOne({ where: { code: memberCode } });
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      const book = await Book.findOne({ where: { code: bookCode } });
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const borrowedBookRecord = await BorrowedBook.findOne({
        where: {
          Member_id: member.id,
          Book_id: book.id,
          return_date: null,
        },
      });
      if (!borrowedBookRecord) {
        return res.status(400).json({
          message:
            "Member hasn't borrowed this book or has already returned it",
        });
      }

      const currentDate = new Date();
      const dueDate = borrowedBookRecord.due_date;
      if (currentDate > dueDate) {
        const penaltyDate = new Date(currentDate);
        penaltyDate.setDate(penaltyDate.getDate() + 3);
        await member.update({ penalty_date: penaltyDate });
      }

      await book.update({ stock: book.stock + 1 });
      await borrowedBookRecord.update({
        return_date: currentDate,
        status: "returned",
      });

      res.status(200).json({ message: "Book returned successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async getAllMembers(req, res) {
    try {
      const members = await Member.findAll();

      for (const element of members) {
        const borrowedBooksCount = await BorrowedBook.count({
          where: {
            Member_id: element.id,
            return_date: null,
          },
        });

        element.dataValues.borrowedBooksCount = borrowedBooksCount;
      }

      res.status(200).json(members);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async getMemberDetails(req, res) {
    try {
      const memberCode = req.params.memberCode;
      const member = await Member.findOne({ where: { code: memberCode } });
      if (member) {
        res.status(200).json(member);
      } else {
        res.status(404).json({ message: "Member not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = Controller;
