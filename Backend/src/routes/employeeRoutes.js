const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router
  .route("/")
  .post(protect, upload.single("profilePic"), createEmployee)
  .get(protect, getEmployees);

router
  .route("/:id")
  .get(protect, getEmployee)
  .put(protect, upload.single("profilePic"), updateEmployee)
  .delete(protect, deleteEmployee);

module.exports = router;