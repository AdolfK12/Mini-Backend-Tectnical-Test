const express = require("express");
const app = express();
const port = 3000;

const cors = require("cors");
const router = require("./routers/router");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Opsi untuk dokumentasi Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PT. Eigen Tri Mathema Backend Test",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${port}/`,
      },
    ],
  },
  apis: ["./routers/router.js"],
};

const specs = swaggerJsdoc(options);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Menyajikan dokumentasi Swagger di "/api-docs"
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
