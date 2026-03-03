import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trash2, LogOut, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LostFoundItem } from '../types';

interface AdminItem extends LostFoundItem {
  moderationStatus: 'pending' | 'approved' | 'rejected';
  claimed?: boolean;
  claimerNickname?: string;
  claimDate?: string;
  claimCreatedAt?: string;
}
type ModerationCounts = Record<'pending' | 'approved' | 'rejected', number>;

const API_ENDPOINT = '/api/admin';

const Admin: React.FC = () => {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [prioritizeClaimedLost, setPrioritizeClaimedLost] = useState(false);
  const [prioritizeClaimedFound, setPrioritizeClaimedFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [counts, setCounts] = useState<ModerationCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_ENDPOINT}?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to load items (${response.status})`);
      }
      const data = await response.json() as { items: AdminItem[]; counts?: ModerationCounts };
      setItems(data.items);
      setCounts(data.counts || {
        pending: filter === 'pending' ? data.items.length : 0,
        approved: filter === 'approved' ? data.items.length : 0,
        rejected: filter === 'rejected' ? data.items.length : 0,
      });
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setError(error instanceof Error ? error.message : 'Failed to load items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void fetchItems();
    }
  }, [isAuthenticated, filter]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setAuthError('Please enter a password');
      return;
    }
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setItems([]);
    setCounts({ pending: 0, approved: 0, rejected: 0 });
  };

  const handleAction = async (itemId: string, action: 'approve' | 'reject' | 'delete') => {
    setActionLoading(itemId);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({ id: itemId, action }),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${action} item (${response.status})`);
      }
      await fetchItems();
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action} item.`);
    } finally {
      setActionLoading(null);
    }
  };

  const displayedItems = React.useMemo(() => {
    if (!prioritizeClaimedLost && !prioritizeClaimedFound) return items;
    return [...items].sort((a, b) => {
      const aLostPriority = a.status === 'lost' && a.claimed && prioritizeClaimedLost ? 1 : 0;
      const bLostPriority = b.status === 'lost' && b.claimed && prioritizeClaimedLost ? 1 : 0;
      if (aLostPriority !== bLostPriority) return bLostPriority - aLostPriority;

      const aFoundPriority = a.status === 'found' && a.claimed && prioritizeClaimedFound ? 1 : 0;
      const bFoundPriority = b.status === 'found' && b.claimed && prioritizeClaimedFound ? 1 : 0;
      if (aFoundPriority !== bFoundPriority) return bFoundPriority - aFoundPriority;

      const aPriority = (aLostPriority || aFoundPriority) ? 1 : 0;
      const bPriority = (bLostPriority || bFoundPriority) ? 1 : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, prioritizeClaimedLost, prioritizeClaimedFound]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Admin Login
          </h1>
          <div className="mb-4 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Main Page
            </Link>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your admin password"
                required
              />
            </div>
            {authError && (
              <p className="text-sm text-red-600">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Main Page
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {(['pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && counts.pending > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {counts.pending}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setPrioritizeClaimedLost((prev) => !prev)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              prioritizeClaimedLost
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Put claimed lost items on top"
          >
            Claimed Lost First
          </button>
          <button
            onClick={() => setPrioritizeClaimedFound((prev) => !prev)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              prioritizeClaimedFound
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Put claimed found items on top"
          >
            Claimed Found First
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading items...</p>
          </div>
        )}

        {/* Items List */}
        {!isLoading && items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No items found.</p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="space-y-4">
            {displayedItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        item.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.status}
                      </span>
                      {item.claimed && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          claimed
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Location:</span>
                        <span className="ml-2 text-gray-600">{item.location}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date:</span>
                        <span className="ml-2 text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Contact:</span>
                        <span className="ml-2 text-gray-600">{item.contact}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Posted:</span>
                        <span className="ml-2 text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      {item.claimed && (
                        <>
                          <div>
                            <span className="font-medium text-gray-700">Claimed nickname:</span>
                            <span className="ml-2 text-gray-600">{item.claimerNickname || '-'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Claim date:</span>
                            <span className="ml-2 text-gray-600">{item.claimDate ? new Date(item.claimDate).toLocaleDateString() : '-'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {filter === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(item.id, 'approve')}
                          disabled={actionLoading === item.id}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'reject')}
                          disabled={actionLoading === item.id}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleAction(item.id, 'delete')}
                      disabled={actionLoading === item.id}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
