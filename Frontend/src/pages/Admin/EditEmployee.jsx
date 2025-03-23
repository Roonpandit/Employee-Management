import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "./Navbar";
import "./EditEmployee.css";

function EditEmployee() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    salary: "",
    joinDate: "",
    phone: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const EMPLOYEE_ENDPOINT = import.meta.env.VITE_EMPLOYEE_ENDPOINT;
  const UPDATE_EMPLOYEE_ENDPOINT = import.meta.env
    .VITE_UPDATE_EMPLOYEE_ENDPOINT;

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!accessToken || !employeeId) {
        setLoading(false);
        setError("Missing required information");
        return;
      }

      try {
        const employeeDetailEndpoint = `${EMPLOYEE_ENDPOINT}/${employeeId}`;

        const response = await axios.get(employeeDetailEndpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        let employeeData = {};

        if (response.data && typeof response.data === "object") {
          if (response.data.data) {
            employeeData = response.data.data;
          } else {
            employeeData = response.data;
          }
        }

        const formattedJoinDate = employeeData.joinDate
          ? new Date(employeeData.joinDate).toISOString().split("T")[0]
          : "";

        setFormData({
          name: employeeData.name || "",
          email: employeeData.email || "",
          department: employeeData.department || "",
          position: employeeData.position || "",
          salary: employeeData.salary || "",
          joinDate: formattedJoinDate,
          phone: employeeData.phone || "",
        });

        if (employeeData.profilePic && employeeData.profilePic.url) {
          setProfileImagePreview(employeeData.profilePic.url);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError("Failed to load employee data. Please try again later.");
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [accessToken, employeeId, EMPLOYEE_ENDPOINT]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const updateData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          updateData.append(key, formData[key]);
        }
      });

      if (profileImage) {
        updateData.append("profilePic", profileImage);
      }

      const updateEndpoint = UPDATE_EMPLOYEE_ENDPOINT
        ? UPDATE_EMPLOYEE_ENDPOINT.replace(":id", employeeId)
        : `${EMPLOYEE_ENDPOINT}/${employeeId}`;
      const response = await axios.put(updateEndpoint, updateData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Employee updated successfully!");
      setLoading(false);

      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update employee. Please try again later.");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  return (
    <>
      <Navbar />
      <div className="edit-employee-container">
        <h1>Edit Employee</h1>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {!loading && !error && (
          <form onSubmit={handleSubmit} className="employee-form">
            <div className="form-image-section">
              <div className="profile-image-container">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile preview"
                    className="profile-image-preview"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    {formData.name ? formData.name.charAt(0) : "E"}
                  </div>
                )}
              </div>

              <div className="image-upload-container">
                <label htmlFor="profile-image" className="image-upload-label">
                  Change Profile Image
                </label>
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-upload-input"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Employee Name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Department"
                />
              </div>

              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Job Position"
                />
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salary</label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="Salary Amount"
                />
              </div>

              <div className="form-group">
                <label htmlFor="joinDate">Join Date</label>
                <input
                  type="date"
                  id="joinDate"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default EditEmployee;
