import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";

function Feeds() {
  const [feeds, setFeeds] = useState([]);
  const [form, setForm] = useState({
    name: "",
    source_type: "url",
    source: "",
    refresh_value: 0,
    refresh_unit: "hours",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [timezone, setTimezone] = useState("UTC");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchFeeds();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setTimezone(res.data.timezone || "UTC");
      setSettingsLoaded(true);
    } catch (err) {
      console.error("Failed to load settings", err);
      setSettingsLoaded(true);
    }
  };

  const fetchFeeds = async () => {
    try {
      const res = await api.get("/feeds");
      setFeeds(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const formatDateInTimezone = (dateString) => {
    if (!dateString) return "Never";
    try {
      const utcDate = new Date(dateString + " UTC"); // ensure UTC parsing
      if (isNaN(utcDate.getTime())) return "Invalid date";
      // Convert to target timezone using Intl
      return new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      }).format(utcDate);
    } catch (e) {
      return new Date(dateString).toLocaleString();
    }
  };
  const formatRefreshInterval = (hours) => {
    if (!hours || hours === 0) return "Never";
    if (hours >= 1 && (hours * 60) % 60 === 0 && hours <= 24) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    const minutes = hours * 60;
    if (minutes < 60 && minutes % 1 === 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    return `${hours} hours`;
  };

  const resetForm = () => {
    setForm({
      name: "",
      source_type: "url",
      source: "",
      refresh_value: 0,
      refresh_unit: "hours",
    });
    setFile(null);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("source_type", form.source_type);
    if (form.source_type === "url") {
      formData.append("source", form.source);
    } else {
      if (file) formData.append("file", file);
    }
    let refreshHours = form.refresh_value;
    if (form.refresh_unit === "minutes") {
      refreshHours = form.refresh_value / 60;
    }
    formData.append("refresh_interval_hours", refreshHours);
    try {
      if (editingId) {
        await api.put(`/feeds/${editingId}`, formData);
      } else {
        await api.post("/feeds", formData);
      }
      await fetchFeeds();
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feed) => {
    setEditingId(feed.id);
    let refreshHours = feed.refresh_interval_hours || 0;
    let refreshValue = refreshHours;
    let refreshUnit = "hours";
    if (refreshHours > 0 && (refreshHours * 60) % 1 === 0 && refreshHours * 60 <= 60) {
      refreshValue = refreshHours * 60;
      refreshUnit = "minutes";
    }
    setForm({
      name: feed.name,
      source_type: feed.source_type,
      source: feed.source,
      refresh_value: refreshValue,
      refresh_unit: refreshUnit,
    });
    setFile(null);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this feed?")) return;
    try {
      await api.delete(`/feeds/${id}`);
      await fetchFeeds();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/50 border border-red-600 text-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-900/90 to-slate-800/80 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-400/90">
                Feed Management
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Manage Feeds
              </h1>
              <p className="mt-3 text-sm text-slate-400 sm:text-base">
                Add and organize your content feeds from URLs or uploaded XML
                files.
              </p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:from-blue-700 hover:to-blue-800"
              >
                <span className="mr-2 text-base leading-none">+</span> Add Feed
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-800 to-slate-700 shadow-xl">
          <div className="border-b border-slate-600/80 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Your Feeds</h2>
                <p className="mt-1 text-sm text-slate-400">
                  View, maintain, and remove feeds.
                </p>
              </div>
              <div className="inline-flex w-fit items-center rounded-full border border-slate-600 bg-slate-900/50 px-3 py-1 text-xs font-medium text-slate-300">
                {feeds.length} {feeds.length === 1 ? "feed" : "feeds"}
              </div>
            </div>
          </div>

          {feeds.length > 0 ? (
            <ul className="divide-y divide-slate-600/80">
              {feeds.map((feed) => (
                <li
                  key={feed.id}
                  className="px-6 py-5 transition duration-200 hover:bg-slate-800/50 sm:px-8"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold text-white">
                            {feed.name}
                          </h3>
                        </div>
                        <span className="inline-flex w-fit items-center rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
                          {feed.source_type === "url"
                            ? "URL Source"
                            : "File Upload"}
                        </span>
                      </div>
                      <div className="mt-4 rounded-xl border border-slate-600/70 bg-slate-900/40 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {feed.source_type === "url"
                            ? "Feed URL"
                            : "File Source"}
                        </p>
                        <p className="mt-2 break-all font-mono text-sm text-slate-300">
                          {feed.source}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                        <span>
                          Created:{" "}
                          {settingsLoaded
                            ? formatDateInTimezone(feed.created_at)
                            : new Date(feed.created_at).toLocaleString()}
                        </span>
                        {feed.refresh_interval_hours > 0 && (
                          <>
                            <span className="text-blue-400">
                              Auto-refresh:{" "}
                              {formatRefreshInterval(feed.refresh_interval_hours)}
                            </span>
                            {feed.last_refresh_at && (
                              <span className="text-blue-400">
                                Last refreshed:{" "}
                                {settingsLoaded
                                  ? formatDateInTimezone(feed.last_refresh_at)
                                  : new Date(feed.last_refresh_at).toLocaleString()}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-start gap-2">
                      <button
                        onClick={() => handleEdit(feed)}
                        className="inline-flex items-center justify-center rounded-xl border border-indigo-600/30 px-4 py-2.5 text-sm font-medium text-indigo-400 transition duration-200 hover:border-indigo-600/60 hover:bg-indigo-900/20 hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(feed.id)}
                        className="inline-flex items-center justify-center rounded-xl border border-red-600/30 px-4 py-2.5 text-sm font-medium text-red-400 transition duration-200 hover:border-red-600/60 hover:bg-red-900/20 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-16 text-center sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/50">
                <svg
                  className="h-8 w-8 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4"
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                No feeds yet
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Start by adding your first feed.
              </p>
            </div>
          )}
        </div>
      </div>

      {isDialogOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setIsDialogOpen(false);
            resetForm();
          }}
        />
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-600 bg-gradient-to-br from-slate-800 to-slate-700 shadow-2xl shadow-black/40">
            <div className="border-b border-slate-600/80 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingId ? "Edit Feed" : "Add New Feed"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Connect a feed by URL or upload an XML file.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900/40 hover:text-white"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-6 sm:px-8">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-600 text-red-200 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Feed Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter feed name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Source Type
                  </label>
                  <select
                    value={form.source_type}
                    onChange={(e) =>
                      setForm({ ...form, source_type: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="url" className="bg-slate-900">
                      URL
                    </option>
                    <option value="upload" className="bg-slate-900">
                      Upload XML File
                    </option>
                  </select>
                </div>
                {form.source_type === "url" ? (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      Feed URL
                    </label>
                    <input
                      type="url"
                      value={form.source}
                      onChange={(e) =>
                        setForm({ ...form, source: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/feed"
                      required={!editingId}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      XML File
                    </label>
                    <div className="rounded-xl border border-dashed border-slate-600 bg-slate-900/50 p-4">
                      <input
                        type="file"
                        accept=".xml,.rss,.atom"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full cursor-pointer text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                        required={!editingId}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Auto-Refresh
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.refresh_value}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          refresh_value: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-32 rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <select
                      value={form.refresh_unit}
                      onChange={(e) =>
                        setForm({ ...form, refresh_unit: e.target.value })
                      }
                      className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hours">Hours</option>
                      <option value="minutes">Minutes</option>
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Set to 0 to disable auto-refresh. The system will re-fetch
                    the feed at this interval.
                  </p>
                </div>
                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-600 px-4 py-3 font-medium text-slate-300 transition duration-200 hover:border-slate-500 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        {editingId ? "Updating..." : "Adding..."}
                      </span>
                    ) : editingId ? (
                      "Update Feed"
                    ) : (
                      "Add Feed"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feeds;