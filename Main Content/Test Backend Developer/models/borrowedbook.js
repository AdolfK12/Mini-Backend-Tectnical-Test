"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BorrowedBook extends Model {
    static associate(models) {
      this.belongsTo(models.Member, {
        foreignKey: "Member_id",
      });
      this.belongsTo(models.Book, {
        foreignKey: "Book_id",
      });
    }
  }
  BorrowedBook.init(
    {
      Member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Members",
          key: "id",
        },
      },
      Book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Books",
          key: "id",
        },
      },
      borrow_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      return_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["borrowed", "returned"]],
        },
      },
    },
    {
      sequelize,
      modelName: "BorrowedBook",
      timestamps: true,
    }
  );
  return BorrowedBook;
};
