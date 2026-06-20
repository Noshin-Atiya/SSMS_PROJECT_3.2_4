import { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/CSS/admin/users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/users");
    setUsers(res.data);
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:5000/deleteUser/${id}`);
    fetchUsers();
  };

  const toggleUser = async (id, active) => {
    await axios.post("http://localhost:5000/toggleUser", {
      id,
      active: !active,
    });
    fetchUsers();
  };

  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.role].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h2>Users</h2>
          <p>Manage all registered accounts</p>
        </div>

        <div className="users-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            placeholder="Search by name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="user-cell">
                      <span className="user-avatar">{initials(u.name)}</span>
                      <span className="user-name">{u.name}</span>
                    </div>
                  </td>
                  <td className="muted-cell">{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${u.active ? "active" : "inactive"}`}>
                      <span className="status-dot" />
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-toggle"
                        onClick={() => toggleUser(u._id, u.active)}
                      >
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteUser(u._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}