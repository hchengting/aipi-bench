"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load users");
      }
      const data = await res.json();
      setUsers(data.users || []);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setFormSuccess(`User "${data.user.username}" created successfully.`);
      setUsername("");
      setPassword("");
      setRole("user");
      await fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      setFormError(message);
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Users</h1>

      {/* Create User Form */}
      <div className="bg-bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? "Creating..." : "Create User"}
            </button>
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-sm text-green-400">
              {formSuccess}
            </div>
          )}
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">All Users</h2>

        {loading && (
          <p className="text-muted text-center py-8">Loading users...</p>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <p className="text-muted text-center py-8">No users found.</p>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="pb-3 pr-4 font-medium">ID</th>
                  <th className="pb-3 pr-4 font-medium">Username</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 transition-colors hover:bg-bg-card/50"
                  >
                    <td className="py-3 pr-4 text-muted">{user.id}</td>
                    <td className="py-3 pr-4 font-medium text-text-primary">
                      {user.username}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-accent-blue/10 text-accent-blue"
                            : "bg-border text-muted"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
