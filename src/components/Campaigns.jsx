import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [form, setForm] = useState({
    feed_id: "",
    name: "",
    keywords: [],
    daily_click_target: "",
    start_time: "09:00",
    end_time: "18:00",
    click_interval_min: 60,
    click_interval_max: 120,
    proxy_rotation_strategy: "round-robin",
    browser_rotation_strategy: "per-click",
    hourly_click_limit: 0,
    browser_profile: "desktop",
    target_country: "Remote",
  });
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [keywordInput, setKeywordInput] = useState("");

  // Complete country list (grouped by region)
  const countryGroups = {
    "🌍 Remote": ["Remote"],
    "🇪🇺 Europe": [
      "Austria",
      "Belgium",
      "Switzerland",
      "Czech Republic",
      "Denmark",
      "Germany",
      "Spain",
      "Finland",
      "France",
      "United Kingdom",
      "Greece",
      "Hungary",
      "Ireland",
      "Italy",
      "Luxembourg",
      "Netherlands",
      "Norway",
      "Poland",
      "Portugal",
      "Romania",
      "Russia",
      "Sweden",
      "Turkey",
      "Ukraine",
    ],
    "🌎 America": [
      "Argentina",
      "Brazil",
      "Canada",
      "Chile",
      "Colombia",
      "Costa Rica",
      "Dominican Republic",
      "Ecuador",
      "Guatemala",
      "Mexico",
      "Panama",
      "Peru",
      "United States",
      "Uruguay",
      "Venezuela",
    ],
    "🌏 Asia / Oceania": [
      "United Arab Emirates",
      "Bahrain",
      "China",
      "Hong Kong",
      "India",
      "Indonesia",
      "Israel",
      "Japan",
      "Kazakhstan",
      "Kuwait",
      "Lebanon",
      "Malaysia",
      "New Zealand",
      "Oman",
      "Pakistan",
      "Philippines",
      "Qatar",
      "Saudi Arabia",
      "Singapore",
      "South Korea",
      "Taiwan",
      "Thailand",
      "Vietnam",
    ],
    "🌍 Africa": [
      "Ivory Coast",
      "Cameroon",
      "Egypt",
      "Ghana",
      "Kenya",
      "Morocco",
      "Mozambique",
      "Nigeria",
      "Senegal",
      "South Africa",
      "Tunisia",
      "Uganda",
      "Zambia",
    ],
  };

  useEffect(() => {
    fetchCampaigns();
    fetchFeeds();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get("/campaigns");
      setCampaigns(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const fetchFeeds = async () => {
    try {
      const res = await api.get("/feeds");
      setFeeds(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const resetForm = () => {
    setForm({
      feed_id: "",
      name: "",
      keywords: [],
      daily_click_target: "",
      start_time: "09:00",
      end_time: "18:00",
      click_interval_min: 60,
      click_interval_max: 120,
      proxy_rotation_strategy: "round-robin",
      browser_rotation_strategy: "per-click",
      hourly_click_limit: 0,
      browser_profile: "desktop",
      target_country: "Remote",
    });
    setKeywordInput("");
    setEditingId(null);
    setError(null);
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !form.keywords.includes(trimmed)) {
      setForm({ ...form, keywords: [...form.keywords, trimmed] });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setForm({
      ...form,
      keywords: form.keywords.filter((k) => k !== keywordToRemove),
    });
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      ...form,
      keywords: form.keywords,
      daily_click_target: parseInt(form.daily_click_target),
      click_interval_min: parseInt(form.click_interval_min),
      click_interval_max: parseInt(form.click_interval_max),
      hourly_click_limit: parseInt(form.hourly_click_limit) || 0,
    };
    try {
      if (editingId) {
        await api.put(`/campaigns/${editingId}`, payload);
      } else {
        await api.post("/campaigns", payload);
      }
      await fetchCampaigns();
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign) => {
    setEditingId(campaign.id);
    let keywordsArray = [];
    if (campaign.keywords) {
      if (Array.isArray(campaign.keywords)) {
        keywordsArray = campaign.keywords;
      } else if (typeof campaign.keywords === "string") {
        try {
          const parsed = JSON.parse(campaign.keywords);
          keywordsArray = Array.isArray(parsed) ? parsed : [];
        } catch {
          keywordsArray = campaign.keywords
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k);
        }
      }
    }
    setForm({
      feed_id: campaign.feed_id,
      name: campaign.name,
      keywords: keywordsArray,
      daily_click_target: campaign.daily_click_target,
      start_time: campaign.start_time,
      end_time: campaign.end_time,
      click_interval_min: campaign.click_interval_min,
      click_interval_max: campaign.click_interval_max,
      proxy_rotation_strategy: campaign.proxy_rotation_strategy,
      browser_rotation_strategy: campaign.browser_rotation_strategy,
      hourly_click_limit: campaign.hourly_click_limit || 0,
      browser_profile: campaign.browser_profile || "desktop",
      target_country: campaign.target_country || "Remote",
    });
    setKeywordInput("");
    setError(null);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const campaign = campaigns.find((c) => c.id === id);
    try {
      await api.put(`/campaigns/${id}`, {
        ...campaign,
        status: currentStatus ? 0 : 1,
      });
      await fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await api.delete(`/campaigns/${id}`);
      await fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
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

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Campaigns</h1>
            <p className="text-gray-400">
              Create and manage your click campaigns
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg shadow-blue-500/20"
          >
            + Create Campaign
          </button>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden shadow-lg">
          {campaigns.length > 0 ? (
            <ul className="divide-y divide-slate-600">
              {campaigns.map((campaign) => (
                <li
                  key={campaign.id}
                  className="px-6 py-6 hover:bg-slate-750 transition duration-200 border-b border-slate-600 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            campaign.status
                              ? "bg-emerald-900/40 text-emerald-300 border border-emerald-600/40"
                              : "bg-red-900/40 text-red-300 border border-red-600/40"
                          }`}
                        >
                          {campaign.status ? "Active" : "Paused"}
                        </span>
                        <h3 className="text-xl font-semibold text-white">
                          {campaign.name}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="text-gray-400">
                          Feed:{" "}
                          <span className="text-gray-300 font-medium">
                            {campaign.feed_name}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          Daily:{" "}
                          <span className="text-gray-300 font-medium">
                            {campaign.daily_click_target}
                          </span>{" "}
                          clicks
                        </div>
                        <div className="text-gray-400">
                          Hourly:{" "}
                          <span className="text-gray-300 font-medium">
                            {campaign.hourly_click_limit || "∞"}
                          </span>{" "}
                          clicks
                        </div>
                        <div className="text-gray-400">
                          Interval:{" "}
                          <span className="text-gray-300 font-medium">
                            {campaign.click_interval_min}-
                            {campaign.click_interval_max}s
                          </span>
                        </div>
                        <div className="text-gray-400">
                          Keywords:{" "}
                          <span className="font-mono text-xs text-gray-300">
                            {campaign.keywords}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          Time:{" "}
                          <span className="text-gray-300 font-medium">
                            {campaign.start_time}–{campaign.end_time}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          Proxy:{" "}
                          <span className="text-gray-300 font-medium capitalize">
                            {campaign.proxy_rotation_strategy}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          Browser:{" "}
                          <span className="text-gray-300 font-medium capitalize">
                            {campaign.browser_profile || "desktop"}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          Target Country:{" "}
                          <span className="text-gray-300 font-medium">
                            {campaign.target_country || "Remote"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 items-center">
                      <button
                        onClick={() => handleEdit(campaign)}
                        className="px-4 py-2 bg-indigo-900/40 text-indigo-300 border border-indigo-600/40 hover:bg-indigo-900/60 rounded-lg text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleToggleStatus(campaign.id, campaign.status)
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                          campaign.status ? "bg-blue-600" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            campaign.status ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="px-4 py-2 bg-red-900/40 text-red-300 border border-red-600/40 hover:bg-red-900/60 rounded-lg text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-16 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-gray-400 text-lg">No campaigns yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Click "Create Campaign" to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {isDialogOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setIsDialogOpen(false);
            resetForm();
          }}
        />
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6 z-10 pb-4">
                <h2 className="text-2xl font-bold text-white">
                  {editingId ? "Edit Campaign" : "Create New Campaign"}
                </h2>
                <button
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg
                    className="h-6 w-6"
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
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-600 text-red-200 text-sm">
                  {error}
                </div>
              )}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Feed
                  </label>
                  <select
                    value={form.feed_id}
                    onChange={(e) =>
                      setForm({ ...form, feed_id: e.target.value })
                    }
                    required
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Feed</option>
                    {feeds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Q1 Campaign"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Keywords (press Enter to add)
                  </label>
                  <div className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="flex flex-wrap gap-2 p-2">
                      {form.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/30 text-blue-300 rounded-md text-sm"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(kw)}
                            className="hover:text-red-400 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordKeyDown}
                        onBlur={handleAddKeyword}
                        className="flex-1 min-w-[120px] bg-transparent text-white placeholder-gray-500 focus:outline-none py-1 px-1"
                        placeholder="Type keyword and press Enter"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Press Enter or comma to add a keyword. Click × to remove.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Daily Click Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.daily_click_target}
                    onChange={(e) =>
                      setForm({ ...form, daily_click_target: e.target.value })
                    }
                    required
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Hourly Click Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.hourly_click_limit}
                    onChange={(e) =>
                      setForm({ ...form, hourly_click_limit: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">0 = unlimited</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) =>
                      setForm({ ...form, start_time: e.target.value })
                    }
                    required
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) =>
                      setForm({ ...form, end_time: e.target.value })
                    }
                    required
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Min Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.click_interval_min}
                    onChange={(e) =>
                      setForm({ ...form, click_interval_min: e.target.value })
                    }
                    required
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Max Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.click_interval_max}
                    onChange={(e) =>
                      setForm({ ...form, click_interval_max: e.target.value })
                    }
                    required
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Proxy Rotation
                  </label>
                  <select
                    value={form.proxy_rotation_strategy}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        proxy_rotation_strategy: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="round-robin">Round Robin</option>
                    <option value="random">Random</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Browser Rotation
                  </label>
                  <select
                    value={form.browser_rotation_strategy}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        browser_rotation_strategy: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="per-click">New Browser per Click</option>
                    <option value="single-per-campaign">
                      Single Browser per Campaign
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Browser Profile
                  </label>
                  <select
                    value={form.browser_profile}
                    onChange={(e) =>
                      setForm({ ...form, browser_profile: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desktop">
                      Desktop Chrome (Random fingerprint)
                    </option>
                    <option value="mobile">
                      Mobile Chrome (Random fingerprint)
                    </option>
                    <option value="random">Random (Desktop or Mobile)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-400">
                    10 different fingerprints per device type
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Target Country
                  </label>
                  <select
                    value={form.target_country}
                    onChange={(e) =>
                      setForm({ ...form, target_country: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(countryGroups).map(
                      ([groupName, countries]) => (
                        <optgroup key={groupName} label={groupName}>
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </optgroup>
                      )
                    )}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    If "Remote", uses the country from the feed item. Otherwise,
                    forces this country for all clicks.
                  </p>
                </div>
                <div className="md:col-span-2 flex gap-3 pt-4  pb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 text-gray-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        {editingId ? "Updating..." : "Creating..."}
                      </span>
                    ) : editingId ? (
                      "Update Campaign"
                    ) : (
                      "Create Campaign"
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

export default Campaigns;
