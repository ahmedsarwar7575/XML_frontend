import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from './Navbar';

function Proxies() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [proxies, setProxies] = useState([]);
  const [newProxy, setNewProxy] = useState('');
  const [editingProxy, setEditingProxy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) fetchProxies();
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const fetchProxies = async () => {
    try {
      const res = await api.get(`/proxies/campaign/${selectedCampaign}`);
      setProxies(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const addProxy = async () => {
    if (!newProxy.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/proxies', { campaign_id: selectedCampaign, proxy_url: newProxy });
      setNewProxy('');
      await fetchProxies();
      setIsDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProxy = async () => {
    try {
      await api.put(`/proxies/${editingProxy.id}`, { proxy_url: editingProxy.proxy_url });
      setEditingProxy(null);
      await fetchProxies();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const deleteProxy = async (id) => {
    if (!confirm('Delete this proxy?')) return;
    try {
      await api.delete(`/proxies/${id}`);
      await fetchProxies();
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
            <h1 className="text-4xl font-bold text-white mb-2">Proxy Management</h1>
            <p className="text-gray-400">Configure proxies for your campaigns</p>
          </div>
          {selectedCampaign && (
            <button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg shadow-blue-500/20">
              + Add Proxy
            </button>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden p-6 shadow-lg mb-8">
          <label className="block text-sm font-semibold text-gray-200 mb-3">Select Campaign</label>
          <select
            value={selectedCampaign}
            onChange={e => setSelectedCampaign(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          >
            <option value="">Choose a campaign</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {selectedCampaign && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-sm border border-slate-600 rounded-xl overflow-hidden shadow-lg">
            {proxies.length > 0 ? (
              <ul className="divide-y divide-slate-600">
                {proxies.map(proxy => (
                  <li key={proxy.id} className="px-6 py-5 hover:bg-slate-750 transition duration-200 flex items-center justify-between gap-4 border-b border-slate-600 last:border-b-0">
                    {editingProxy?.id === proxy.id ? (
                      <input
                        type="text"
                        value={editingProxy.proxy_url}
                        onChange={e => setEditingProxy({ ...editingProxy, proxy_url: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                        autoFocus
                      />
                    ) : (
                      <span className="font-mono text-sm text-gray-300 break-all">{proxy.proxy_url}</span>
                    )}
                    <div className="flex gap-2 flex-shrink-0">
                      {editingProxy?.id === proxy.id ? (
                        <>
                          <button onClick={updateProxy} className="px-4 py-2 bg-green-900/40 text-green-300 border border-green-600/40 hover:bg-green-900/60 rounded-lg text-sm font-medium transition">Save</button>
                          <button onClick={() => setEditingProxy(null)} className="px-4 py-2 bg-gray-700/40 text-gray-300 border border-gray-600/40 hover:bg-gray-700/60 rounded-lg text-sm font-medium transition">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditingProxy(proxy)} className="px-4 py-2 bg-indigo-900/40 text-indigo-300 border border-indigo-600/40 hover:bg-indigo-900/60 rounded-lg text-sm font-medium transition">Edit</button>
                          <button onClick={() => deleteProxy(proxy.id)} className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 font-medium rounded-lg transition duration-200 border border-red-600/30 hover:border-red-600/60">Delete</button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-16 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-gray-400 text-lg">No proxies configured</p>
                <p className="text-gray-500 text-sm mt-1">Click "Add Proxy" to configure proxies for this campaign</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsDialogOpen(false)} />
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Proxy</h2>
                <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-600 text-red-200 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">Proxy URL</label>
                  <input
                    type="text"
                    placeholder="http://user:pass@ip:port"
                    value={newProxy}
                    onChange={e => setNewProxy(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                  <p className="mt-2 text-xs text-gray-400">Format: http://username:password@host:port</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsDialogOpen(false)} className="flex-1 px-4 py-3 text-gray-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition duration-200 font-medium">Cancel</button>
                  <button onClick={addProxy} disabled={loading || !newProxy.trim()} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20">
                    {loading ? <span className="flex items-center justify-center"><span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>Adding...</span> : 'Add Proxy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Proxies;