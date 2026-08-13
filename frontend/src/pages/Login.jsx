import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Shield, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(username, password);

      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const fillAccount = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-slate-900 px-6 py-6 text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
              <Shield size={26} className="text-white" />
            </div>

            <h1 className="text-xl font-bold text-white">
              Military Asset Management
            </h1>

            <p className="text-slate-400 mt-1 text-xs">
              Secure Operations Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="mt-3">
          <p className="text-center text-slate-400 text-xs mb-2">Quick Login</p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillAccount("admin_user", "AdminPass123!")}
              className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
            >
              Admin
            </button>

            <button
              type="button"
              onClick={() => fillAccount("commander_alpha", "CommandPass123!")}
              className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
            >
              Commander
            </button>

            <button
              type="button"
              onClick={() =>
                fillAccount("logistics_officer", "LogisticsPass123!")
              }
              className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
            >
              Logistics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
