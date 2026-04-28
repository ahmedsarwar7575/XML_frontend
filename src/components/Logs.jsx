import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/clicks/logs/recent?limit=100");
      setLogs(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter !== "all" && log.status !== filter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        log.campaign_name?.toLowerCase().includes(term) ||
        log.item_title?.toLowerCase().includes(term) ||
        log.final_url?.toLowerCase().includes(term) ||
        log.error_message?.toLowerCase().includes(term) ||
        log.ip_address?.toLowerCase().includes(term) ||
        log.ip_country?.toLowerCase().includes(term) ||
        log.browser_type_used?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/50 border border-red-600 text-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Click Logs</h1>
          <p className="text-gray-400">
            View detailed history of all click attempts
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-slate-600 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-gray-300 hover:bg-slate-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("success")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === "success"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 text-gray-300 hover:bg-slate-700"
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setFilter("failure")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === "failure"
                    ? "bg-red-600 text-white"
                    : "bg-slate-900 text-gray-300 hover:bg-slate-700"
                }`}
              >
                Failure
              </button>
            </div>
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by campaign, item, URL, IP, country, browser, or error..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50">
                <tr className="text-left text-gray-400 border-b border-slate-600">
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Campaign</th>
                  <th className="px-6 py-3">Item Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">IP Country</th>
                  <th className="px-6 py-3">Browser Type</th>
                  <th className="px-6 py-3">Final URL</th>
                  <th className="px-6 py-3">Screenshot</th>
                  <th className="px-6 py-3">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-3 text-gray-300 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-gray-300">
                      {log.campaign_name}
                    </td>
                    <td className="px-6 py-3 text-gray-300 max-w-xs truncate">
                      {log.item_title}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          log.status === "success"
                            ? "bg-emerald-900/40 text-emerald-300 border border-emerald-600/40"
                            : "bg-red-900/40 text-red-300 border border-red-600/40"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-300 font-mono text-xs">
                      {log.ip_address || "-"}
                    </td>
                    <td className="px-6 py-3 text-gray-300">
                      {log.ip_country || "-"}
                    </td>
                    <td className="px-6 py-3 text-gray-300 text-xs">
                      {log.browser_type_used || "-"}
                    </td>
                    <td className="px-6 py-3 max-w-xs text-gray-300 break-words whitespace-normal">
                      <a
                        href={log.final_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {log.final_url}
                      </a>
                    </td>
                    <td className="px-6 py-3">
                      {log.screenshot_path ? (
                        <img
                        className="w-60 h-60 object-cover rounded-md"
                          src={"https://peimark.com/api/" + log.screenshot_path}
                          alt="nothing"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-3 text-red-400 max-w-xs truncate">
                      {log.error_message}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No logs match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;
