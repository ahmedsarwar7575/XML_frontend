import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import Navbar from "./Navbar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalClicks: 0,
    successClicks: 0,
    failureClicks: 0,
    successRate: 0,
    last7Days: [],
    topCampaigns: [],
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get("/dashboard/stats");
        setStats(statsRes.data);
        const logsRes = await api.get("/clicks/logs/recent?limit=20");
        setLogs(logsRes.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const barData = {
    labels: stats.last7Days.map((d) => d.date),
    datasets: [
      {
        label: "Clicks",
        data: stats.last7Days.map((d) => d.count),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };
  const pieData = {
    labels: ["Success", "Failure"],
    datasets: [
      {
        data: [stats.successClicks, stats.failureClicks],
        backgroundColor: ["#10b981", "#ef4444"],
        borderColor: ["#059669", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Monitor your campaigns and performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    Total Campaigns
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {stats.totalCampaigns}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.activeCampaigns} active
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 shadow-lg shadow-blue-500/20">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    Total Clicks
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {stats.totalClicks.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-3 shadow-lg shadow-cyan-500/20">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    Success / Failure
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stats.successClicks} / {stats.failureClicks}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-3 shadow-lg shadow-emerald-500/20">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    Success Rate
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {stats.successRate}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 shadow-lg shadow-purple-500/20">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Last 7 Days Clicks
            </h2>
            <div className="h-80">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { color: "#9ca3af" },
                      grid: { color: "rgba(148, 163, 184, 0.1)" },
                    },
                    x: {
                      ticks: { color: "#9ca3af" },
                      grid: { color: "rgba(148, 163, 184, 0.1)" },
                    },
                  },
                  plugins: { legend: { labels: { color: "#f1f5f9" } } },
                }}
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Success vs Failure
            </h2>
            <div className="h-80">
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { labels: { color: "#f1f5f9" } } },
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Top Campaigns by Clicks
          </h2>
          {stats.topCampaigns.length > 0 ? (
            <div className="space-y-3">
              {stats.topCampaigns.map((campaign, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-slate-600 last:border-0"
                >
                  <span className="text-gray-200">{campaign.name}</span>
                  <span className="text-blue-400 font-semibold">
                    {campaign.clicks} clicks
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No click data available
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Recent Click Logs
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-slate-600">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Campaign</th>
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Final URL</th>
                  <th className="pb-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-600/50">
                    <td className="py-2 text-gray-300">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 text-gray-300">{log.campaign_name}</td>
                    <td className="py-2 text-gray-300 max-w-xs truncate">
                      {log.item_title}
                    </td>
                    <td
                      className={`py-2 font-semibold ${
                        log.status === "success"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {log.status}
                    </td>
                    <td className="py-2 text-gray-300 max-w-xs truncate">
                      {log.final_url}
                    </td>
                    <td className="py-2 text-red-400 max-w-xs truncate">
                      {log.error_message}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">
                      No logs available
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

export default Dashboard;
