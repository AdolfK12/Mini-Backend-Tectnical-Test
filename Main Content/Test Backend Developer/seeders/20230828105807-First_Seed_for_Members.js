"use strict";

const fs = require("fs");
const data = JSON.parse(
  fs.readFileSync("./Data_Dummy/Members.json", "utf-8")
).map((el) => {
  el.createdAt = new Date();
  el.updatedAt = new Date();
  return el;
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Members", data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Member", null, {});
  },
};
