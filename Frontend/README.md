# Employee Management System

A full-stack employee management application with role-based permissions and authentication.

## Live Demo

[View Live Demo](https://employee-management-ashy-seven.vercel.app/)

## Overview

This Employee Management System allows organizations to manage employee data with different permission levels based on user roles. The application features user authentication, role-based access control, and CRUD operations for employee records.

## Features

- **Authentication**
  - User registration and login
  - Role selection during signup (Admin/User)
  - JWT-based authentication
  - Auto logout on token expiration

- **Role-Based Access Control**
  - **Admin Access**:
    - View all employees
    - Create new employees
    - Edit any employee
    - Delete any employee
  
  - **User Access**:
    - View all employees
    - Create new employees
    - Edit only self-created employees
    - Delete only self-created employees

- **Employee Management**
  - Create employee records with details
  - Upload employee photos using Cloudinary
  - View employee information
  - Update employee records
  - Delete employee records

## Tech Stack

### Frontend
- **React** - UI library
- **Redux** - State management
- **HTML/CSS/JavaScript** - Frontend development
- **Vercel** - Frontend deployment

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library
- **JWT** - Authentication
- **Multer** - File upload handling
- **Cloudinary** - Image storage
- **Render** - Backend deployment

## Application Flow

1. **Authentication**
   - Users can register with email and password
   - During registration, users select their role (Admin/User)
   - After successful login, users are redirected to appropriate dashboard based on role:
     - `/admin` - for Admin users
     - `/user` - for regular Users

2. **Admin Dashboard**
   - Displays all employees in the system
   - Full CRUD permission for all employee records

3. **User Dashboard**
   - Displays all employees in the system
   - Create new employees
   - Edit/Delete only the employees created by the logged-in user

## Installation and Setup

### Prerequisites
- Node.js
- MongoDB
- Cloudinary account

### Local Development

1. Clone the repository
   ```
   git clone <repository-url>
   ```

2. Install dependencies for backend
   ```
   cd backend
   npm install
   ```

3. Install dependencies for frontend
   ```
   cd frontend
   npm install
   ```

4. Set up environment variables
   - Create `.env` file in backend directory with:
     ```
     MONGODB_URI=<your-mongodb-connection-string>
     JWT_SECRET=<your-jwt-secret>
     CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
     CLOUDINARY_API_KEY=<your-cloudinary-api-key>
     CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
     ```

5. Run backend server
   ```
   cd backend
   npm start
   ```

6. Run frontend development server
   ```
   cd frontend
   npm start
   ```

## Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render

## Security Features

- Password hashing
- JWT authentication
- Protected routes
- Role-based access control
- Automatic logout on token expiration

## Future Enhancements

- Employee search and filtering
- Department management
- Advanced reporting
- Email notifications
- Password reset functionality

## Contributors

- [Tarun Vashisth](https://github.com/roonpandit)

## License

MIT