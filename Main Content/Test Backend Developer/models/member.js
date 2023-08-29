"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    static associate(models) {
      this.hasMany(models.BorrowedBook, {
        foreignKey: "Member_id",
      });
    }
  }
  Member.init(
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      penalty_date: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Member",
      timestamps: true,
    }
  );
  return Member;
};
