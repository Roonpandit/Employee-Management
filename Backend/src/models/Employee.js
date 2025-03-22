const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    position: {
      type: String,
      required: [true, "Position is required"],
    },
    profilePic: {
      public_id: String,
      url: String,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    joinDate: {
      type: Date,
      required: [true, "Join date is required"],
      default: Date.now,
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
