import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";

function Settings() {
  const [webshareKey, setWebshareKey] = useState("");
  const [capsolverKey, setCapsolverKey] = useState("");
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [headlessMode, setHeadlessMode] = useState(true);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const timezoneList = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Paris",
    "Asia/Karachi",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setWebshareKey(res.data.webshare_api_key || "");
      setCapsolverKey(res.data.capsolver_key || "");
      setCaptchaEnabled(res.data.captcha_enabled || false);
      setHeadlessMode(res.data.headless_mode !== false);
      setAdminUsername(res.data.admin_username || "admin");
      setAdminPassword(res.data.admin_password || "password");
      setTimezone(res.data.timezone || "UTC");
    } catch (err) {
      setError("Failed to load settings");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const payload = {
      webshare_api_key: webshareKey,
      capsolver_key: capsolverKey,
      captcha_enabled: captchaEnabled,
      headless_mode: headlessMode,
      admin_username: adminUsername,
      admin_password: adminPassword,
      timezone: timezone,
    };
    try {
      await api.put("/settings", payload);
      setMessage("Settings saved successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 mb-8">Configure system settings</p>
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-600 text-red-200 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-green-900/40 border border-green-600 text-green-200 text-sm">
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Webshare API Key
              </label>
              <input
                type="text"
                value={webshareKey}
                onChange={(e) => setWebshareKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                placeholder="Enter Webshare API key"
              />
            </div>
            <div className="border-t border-slate-600 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Captcha Solver (Capsolver)
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Capsolver API Key
                </label>
                <input
                  type="text"
                  value={capsolverKey}
                  onChange={(e) => setCapsolverKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <label className="text-sm font-semibold text-gray-200">
                  Enable Captcha Solving
                </label>
                <button
                  type="button"
                  onClick={() => setCaptchaEnabled(!captchaEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    captchaEnabled ? "bg-blue-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      captchaEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="border-t border-slate-600 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Browser Mode
              </h3>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-200">
                  Headless Mode
                </label>
                <button
                  type="button"
                  onClick={() => setHeadlessMode(!headlessMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    headlessMode ? "bg-blue-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      headlessMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="border-t border-slate-600 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Admin Credentials
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Password
                </label>
                <input
                  type="text"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <div className="border-t border-slate-600 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Timezone
              </h3>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                {timezoneList.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-2">
                Used for scheduling clicks and active hours.
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save All Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
