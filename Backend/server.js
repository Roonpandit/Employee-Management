const express = require("express");
require("dotenv").config();
const cors = require("cors");
require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(","),
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
