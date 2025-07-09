import React, { useEffect, useState } from "react";
import "../styles/AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const adminEmail = "admin@example.com"; // Should be set from authenticated user context

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/admin/users", {
        headers: {
          "X-User-Email": adminEmail,
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent if using session-based auth
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (email) => {
    if (email === adminEmail) {
      alert("Cannot delete admin user.");
      return;
    }

    if (!window.confirm(`Permanently delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "DELETE", // More semantically correct than POST for deletion
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": adminEmail,
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      if (data.message) {
        alert(`User ${email} deleted successfully`);
        fetchUsers(); // Refresh the list
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderUserList = () => {
    if (isLoading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (users.length === 0) {
      return <p className="no-users">No users found.</p>;
    }

    return (
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email} className={user.email === adminEmail ? "admin-row" : ""}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  {user.email !== adminEmail && (
                    <button
                      onClick={() => deleteUser(user.email)}
                      className="delete-button"
                      aria-label={`Delete user ${user.email}`}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-users-container">
      <header className="admin-header">
        <h1>User Management</h1>
        <button onClick={fetchUsers} className="refresh-button">
          Refresh List
        </button>
      </header>

      <div className="admin-content">
        <div className="user-count">
          Total Users: {isLoading ? "..." : users.length}
        </div>
        {renderUserList()}
      </div>
    </div>
  );
};

export default AdminUsers;