// src/controllers/employeeController.js
const Employee = require('../models/Employee');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, department, position, phone, joinDate, salary } = req.body;
    
    // Upload image to cloudinary if provided
    let profilePic = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'employees',
        quality: 90,           // Higher quality (0-100)
        width: 800,            // Increased width
        height: 800,           // Maintain aspect ratio
        crop: "limit",         // Preserve aspect ratio while staying within dimensions
        fetch_format: "auto",  // Automatically select optimal format
        resource_type: "image" // Ensure treating as image
      });
      
      profilePic = {
        public_id: result.public_id,
        url: result.secure_url
      };
      
      // Delete file from server
      fs.unlinkSync(req.file.path);
    }
    
    // Create employee
    const employee = await Employee.create({
      name,
      email,
      department,
      position,
      profilePic,
      phone,
      joinDate: joinDate || Date.now(),
      salary,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
exports.updateEmployee = async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if user is authorized to update
    if (employee.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this employee'
      });
    }
    
    // Upload new image if provided
    if (req.file) {
      // Delete previous image if exists
      if (employee.profilePic && employee.profilePic.public_id) {
        await cloudinary.uploader.destroy(employee.profilePic.public_id);
      }
      
      // Upload new image with better quality
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'employees',
        quality: 90,           // Higher quality (0-100)
        width: 800,            // Increased width
        height: 800,           // Maintain aspect ratio
        crop: "limit",         // Preserve aspect ratio while staying within dimensions
        fetch_format: "auto",  // Automatically select optimal format
        resource_type: "image" // Ensure treating as image
      });
      
      req.body.profilePic = {
        public_id: result.public_id,
        url: result.secure_url
      };
      
      // Delete file from server
      fs.unlinkSync(req.file.path);
    }
    
    // Update employee
    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if user is authorized to delete
    if (employee.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this employee'
      });
    }
    
    // Delete image from cloudinary if exists
    if (employee.profilePic && employee.profilePic.public_id) {
      await cloudinary.uploader.destroy(employee.profilePic.public_id);
    }
    
    await employee.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
};