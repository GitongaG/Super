import React from "react";
import { USERS } from "../mockData";

export default function Users() {
  return (
    <div className="page-root">
      <div className="page-header">
        <h2>Users</h2>
        <button className="primary-btn">+ Add User</button>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Actions</th></tr></thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>{u.email}</td>
                <td><button className="icon-btn">Edit</button><button className="icon-btn red">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
