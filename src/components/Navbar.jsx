import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../utils/auth";

function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/feeds", label: "Feeds" },
    { path: "/campaigns", label: "Campaigns" },
    { path: "/proxies", label: "Proxies" },
    { path: "/logs", label: "Logs" },
    { path: "/settings", label: "Settings" },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex-shrink-0 font-bold text-xl tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group ${
                  isActive(link.path)
                    ? "text-blue-400 bg-slate-700"
                    : "text-gray-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300 ${
                    isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-auto md:ml-4 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
