"use strict";

const fs = require("fs");
const data = JSON.parse(
  fs.readFileSync("./Data_Dummy/Books.json", "utf-8")
).map((el) => {
  el.createdAt = new Date();
  el.updatedAt = new Date();
  return el;
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Books", data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Books", null, {});
  },
};
