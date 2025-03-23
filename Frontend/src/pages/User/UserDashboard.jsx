import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./UserDashboard.css";
import { useNavigate } from "react-router-dom";
import Navbars from "./Navbars";

function UserDashboard() {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { accessToken, userId } = useContext(AuthContext);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const EMPLOYEE_ENDPOINT = import.meta.env.VITE_EMPLOYEE_ENDPOINT;
  const FIND_USER_ENDPOINT = import.meta.env.VITE_FIND_USER_ENDPOINT;

  const extractId = (idField) => {
    if (!idField) return null;

    if (typeof idField === "string") return idField;

    if (typeof idField === "object") {
      return idField._id || idField.id || null;
    }

    return null;
  };

  const isCreator = (employee) => {
    if (!employee || !employee.createdBy || !userId) {
      console.log("Missing data for creator check:", { employee, userId });
      return false;
    }

    const creatorId = extractId(employee.createdBy);
    const isOwner = creatorId === userId;

    console.log("Checking creator permission:", {
      creatorId,
      userId,
      isOwner,
      employeeName: employee.name,
    });

    return isOwner;
  };

  useEffect(() => {
    const checkAuth = () => {
      const currentUserId = localStorage.getItem("userId");
      console.log("Current User ID from localStorage:", currentUserId);

      if (!accessToken || !currentUserId) {
        console.log("Missing authentication data:", {
          accessToken,
          currentUserId,
        });
      }
    };

    checkAuth();

    const fetchEmployees = async () => {
      if (!accessToken) {
        console.log("No access token available, skipping fetch");
        return;
      }

      try {
        console.log("Fetching employees with token:", accessToken);
        const response = await axios.get(EMPLOYEE_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        let employeeData = [];
        if (Array.isArray(response.data)) {
          employeeData = response.data;
        } else if (response.data && typeof response.data === "object") {
          if (
            response.data.employees &&
            Array.isArray(response.data.employees)
          ) {
            employeeData = response.data.employees;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            employeeData = response.data.data;
          } else {
            employeeData = [response.data];
          }
        }

        console.log("Employees loaded:", employeeData.length);
        employeeData.forEach((emp) => {
          console.log(
            `Employee ${emp.name || "Unknown"} created by:`,
            extractId(emp.createdBy)
          );
        });

        setEmployees(employeeData);

        if (employeeData.length > 0) {
          const creatorIds = [];

          employeeData.forEach((emp) => {
            if (emp && emp.createdBy) {
              const creatorId = extractId(emp.createdBy);
              if (creatorId && !creatorIds.includes(creatorId)) {
                creatorIds.push(creatorId);
              }
            }
          });

          const userDetails = {};

          for (const id of creatorIds) {
            if (id) {
              try {
                const userEndpoint = FIND_USER_ENDPOINT.replace(":id", id);

                const userResponse = await axios.get(userEndpoint, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                });

                if (
                  userResponse.data &&
                  userResponse.data.data &&
                  userResponse.data.data.name
                ) {
                  userDetails[id] = userResponse.data.data.name;
                } else {
                  userDetails[id] = "Unknown User";
                }
              } catch (userErr) {
                userDetails[id] = "Unknown User";
              }
            }
          }

          setUsers(userDetails);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to load employee data. Please try again later.");
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [
    accessToken,
    API_BASE_URL,
    EMPLOYEE_ENDPOINT,
    FIND_USER_ENDPOINT,
    userId,
    navigate,
  ]);

  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused, refreshing data...");
      setLoading(true);

      const fetchData = async () => {
        const currentToken = localStorage.getItem("accessToken");
        const currentUserId = localStorage.getItem("userId");

        if (!currentToken || !currentUserId) {
          console.log("Session expired, redirecting to login");
          navigate("/");
          return;
        }

        try {
          const response = await axios.get(EMPLOYEE_ENDPOINT, {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          });

          let employeeData = [];
          if (Array.isArray(response.data)) {
            employeeData = response.data;
          } else if (response.data && typeof response.data === "object") {
            if (
              response.data.employees &&
              Array.isArray(response.data.employees)
            ) {
              employeeData = response.data.employees;
            } else if (
              response.data.data &&
              Array.isArray(response.data.data)
            ) {
              employeeData = response.data.data;
            } else {
              employeeData = [response.data];
            }
          }

          const creatorIds = [];
          employeeData.forEach((emp) => {
            if (emp && emp.createdBy) {
              const creatorId = extractId(emp.createdBy);
              if (creatorId && !creatorIds.includes(creatorId)) {
                creatorIds.push(creatorId);
              }
            }
          });

          const userDetails = { ...users };

          for (const id of creatorIds) {
            if (id && !userDetails[id]) {
              try {
                const userEndpoint = FIND_USER_ENDPOINT.replace(":id", id);
                const userResponse = await axios.get(userEndpoint, {
                  headers: {
                    Authorization: `Bearer ${currentToken}`,
                  },
                });

                if (userResponse.data?.data?.name) {
                  userDetails[id] = userResponse.data.data.name;
                } else {
                  userDetails[id] = "Unknown User";
                }
              } catch (userErr) {
                userDetails[id] = "Unknown User";
              }
            }
          }

          setUsers(userDetails);
          setEmployees(employeeData);
          setLoading(false);
        } catch (err) {
          console.error("Error refreshing data:", err);
          setLoading(false);
        }
      };

      fetchData();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [EMPLOYEE_ENDPOINT, navigate]);

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleCloseDetails = () => {
    setSelectedEmployee(null);
  };

  const getCreatorName = (employee) => {
    if (!employee || !employee.createdBy) return "Not provided";

    const creatorId = extractId(employee.createdBy);
    return creatorId ? users[creatorId] || "Unknown user" : "Not provided";
  };

  const handleDelete = async (employee) => {
    if (!isCreator(employee)) {
      alert(
        "Since you didn't create this employee, you can't delete this. Please contact admin."
      );
      return;
    }

    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const DELETE_EMPLOYEE_ENDPOINT =
          import.meta.env.VITE_DELETE_EMPLOYEE_ENDPOINT.replace(
            ":id",
            employee._id
          );

        await axios.delete(DELETE_EMPLOYEE_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setEmployees(employees.filter((emp) => emp._id !== employee._id));

        if (selectedEmployee && selectedEmployee._id === employee._id) {
          setSelectedEmployee(null);
        }
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete employee. Please try again later.");
      }
    }
  };

  const handleEdit = (employee) => {
    if (!isCreator(employee)) {
      alert(
        "Since you didn't create this employee, you can't edit this. Please contact admin."
      );
      return;
    }

    navigate(`/update-employee/${employee._id}`);
  };

  return (
    <>
      <Navbars />
      <div className="user">
        {loading ? (
          <div className="loading">Loading employee data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : employees.length === 0 ? (
          <div className="no-data">No employees found.</div>
        ) : (
          <div className="admin-dashboard">
            <h1>Employee Management Dashboard</h1>

            <div className="employee-list">
              <h2>Employees ({employees.length})</h2>
              <div className="employee-grid">
                {employees.map((employee) => (
                  <div
                    className="employee-card"
                    key={
                      employee._id || Math.random().toString(36).substr(2, 9)
                    }
                  >
                    <div className="employee-avatar">
                      {employee.profilePic?.url ? (
                        <img
                          src={employee.profilePic.url}
                          alt={`${employee.name}'s profile`}
                          className="profile-image rounded"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {employee.name ? employee.name.charAt(0) : "E"}
                        </div>
                      )}
                    </div>
                    <div className="employee-info">
                      <h3>{employee.name || "Unknown"}</h3>
                      <p>{employee.email || "No email provided"}</p>
                      <p>
                        <small>Created by: {getCreatorName(employee)}</small>
                      </p>
                      <div className="employee-actions">
                        <button
                          className="details-button"
                          onClick={() => handleViewDetails(employee)}
                        >
                          See Details
                        </button>

                        <button
                          className="edit-button"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(employee)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedEmployee && (
              <div className="employee-details-modal">
                <div className="modal-content">
                  <span className="close-button" onClick={handleCloseDetails}>
                    &times;
                  </span>
                  <h2>Employee Details</h2>

                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedEmployee.name || "Not provided"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedEmployee.email || "Not provided"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Department:</label>
                      <span>
                        {selectedEmployee.department || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Position:</label>
                      <span>{selectedEmployee.position || "Not provided"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Salary:</label>
                      <span>
                        {selectedEmployee.salary
                          ? `$${
                              typeof selectedEmployee.salary === "number"
                                ? selectedEmployee.salary.toLocaleString()
                                : selectedEmployee.salary
                            }`
                          : "Not provided"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Join Date:</label>
                      <span>
                        {selectedEmployee.joinDate
                          ? new Date(
                              selectedEmployee.joinDate
                            ).toLocaleDateString()
                          : "Not provided"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedEmployee.phone || "Not provided"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Created By:</label>
                      <span>{getCreatorName(selectedEmployee)}</span>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(selectedEmployee)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(selectedEmployee)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default UserDashboard;
