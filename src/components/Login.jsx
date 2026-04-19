import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import api from "../api/axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      if (res.data.success) {
        login();
        navigate("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-8 rounded-2xl shadow-2xl w-96 border border-slate-600">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          Admin Login
        </h2>
        <p className="text-gray-400 text-center mb-8">
          Access the automation dashboard
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-600 text-red-200 text-sm text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition shadow-lg shadow-blue-500/20"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
