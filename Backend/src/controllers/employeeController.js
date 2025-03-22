const Employee = require("../models/Employee");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, department, position, phone, joinDate, salary } =
      req.body;

    let profilePic = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "employees",
        quality: 90,
        width: 800,
        height: 800,
        crop: "limit",
        fetch_format: "auto",
        resource_type: "image",
      });

      profilePic = {
        public_id: result.public_id,
        url: result.secure_url,
      };

      fs.unlinkSync(req.file.path);
    }

    const employee = await Employee.create({
      name,
      email,
      department,
      position,
      profilePic,
      phone,
      joinDate: joinDate || Date.now(),
      salary,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating employee",
      error: error.message,
    });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employee",
      error: error.message,
    });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (
      employee.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this employee",
      });
    }

    if (req.file) {
      if (employee.profilePic && employee.profilePic.public_id) {
        await cloudinary.uploader.destroy(employee.profilePic.public_id);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "employees",
        quality: 90,
        width: 800,
        height: 800,
        crop: "limit",
        fetch_format: "auto",
        resource_type: "image",
      });

      req.body.profilePic = {
        public_id: result.public_id,
        url: result.secure_url,
      };

      fs.unlinkSync(req.file.path);
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating employee",
      error: error.message,
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    if (
      employee.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this employee",
      });
    }

    if (employee.profilePic && employee.profilePic.public_id) {
      await cloudinary.uploader.destroy(employee.profilePic.public_id);
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting employee",
      error: error.message,
    });
  }
};
