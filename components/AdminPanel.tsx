"use client";

import { useState, useEffect } from "react";
import { Shield, Crown, RefreshCw, Zap, Users, Star, Mail, CheckCircle, XCircle, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  plan: string;
  daily_credits_used: number;
  monthly_credits_used: number;
  daily_limit: number;
  monthly_limit: number;
}

interface UpgradeRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  requested_plan: string;
  message: string;
  status: string;
  admin_notes: string;
  created_at: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "requests">("requests");

  const token = typeof window !== 'undefined' ? localStorage.getItem("eaglecode_token") : null;

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
          setIsAdmin(true);
          await loadUpgradeRequests();
        }
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUpgradeRequests = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/upgrade-requests", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUpgradeRequests(data.requests);
      }
    } catch (error) {
      console.error("Failed to load upgrade requests:", error);
    }
  };

  const upgradeUser = async (userId: string, newPlan: string) => {
    setUpgrading(userId);
    try {
      const response = await fetch("http://localhost:8000/api/admin/upgrade-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId, plan: newPlan })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`User upgraded to ${newPlan.toUpperCase()} plan!`);
        await checkAdminAndLoadData();
      } else {
        toast.error("Upgrade failed");
      }
    } catch (error) {
      toast.error("Upgrade failed");
    } finally {
      setUpgrading(null);
    }
  };

  const resetCredits = async (userId: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/reset-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Credits reset successfully!");
        await checkAdminAndLoadData();
      }
    } catch (error) {
      toast.error("Failed to reset credits");
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/update-request-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ request_id: requestId, status, admin_notes: notes || "" })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Request ${status}!`);
        await loadUpgradeRequests();
      }
    } catch (error) {
      toast.error("Failed to update request");
    }
  };

  const getPlanBadge = (plan: string) => {
    switch(plan) {
      case "pro":
        return <span className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xs font-bold text-white">PRO</span>;
      case "business":
        return <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white">BUSINESS</span>;
      default:
        return <span className="px-2 py-1 bg-gray-600 rounded-full text-xs font-bold text-white">FREE</span>;
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch(status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">✓ Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">✗ Rejected</span>;
      case "contacted":
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">📧 Contacted</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">⏳ Pending</span>;
    }
  };

  const sendPaymentEmail = (email: string, plan: string, userName: string) => {
    const subject = `EagleCode Upgrade Request - ${plan.toUpperCase()} Plan`;
    const body = `Hi ${userName || email.split('@')[0]},

Thank you for your interest in upgrading to the ${plan.toUpperCase()} plan!

Payment Options:

🏦 Bank Transfer:
   Bank: Example Bank
   Account Name: EagleCode
   Account Number: 1234567890
   Swift Code: EXMPUS33

💳 Credit Card:
   Visit: https://eaglecode.com/payment

🪙 Cryptocurrency:
   USDT (TRC20): TX8sVgZxXyZ1234567890ABCDEF
   Bitcoin: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

After payment, send proof to: payments@eaglecode.com

We'll upgrade your account within 2 hours of payment confirmation.

Best regards,
EagleCode Team`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Admin Access Required</h1>
          <p className="text-gray-400 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <Crown className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-gray-400">Manage users, plans, and upgrade requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-gray-400 text-sm">Pro Users</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.plan === "pro").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-gray-400 text-sm">Business Users</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.plan === "business").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-cyan-500" />
              <div>
                <p className="text-gray-400 text-sm">Pending Requests</p>
                <p className="text-2xl font-bold text-white">{upgradeRequests.filter(r => r.status === "pending").length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "requests"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Upgrade Requests ({upgradeRequests.filter(r => r.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "users"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users Management
          </button>
        </div>

        {/* Upgrade Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {upgradeRequests.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No upgrade requests yet</p>
              </div>
            ) : (
              upgradeRequests.map((req) => (
                <div key={req.id} className="bg-white/5 rounded-xl border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{req.user_name || req.user_email}</h3>
                        {getRequestStatusBadge(req.status)}
                      </div>
                      <p className="text-sm text-gray-400">{req.user_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(req.created_at).toLocaleString()}</p>
                      <p className="text-xs text-cyan-400 mt-1">Requested: {req.requested_plan.toUpperCase()}</p>
                    </div>
                  </div>

                  {req.message && (
                    <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-300">{req.message}</p>
                    </div>
                  )}

                  {req.admin_notes && (
                    <div className="bg-cyan-500/10 rounded-lg p-3 mb-4 border border-cyan-500/20">
                      <p className="text-xs text-cyan-400 mb-1">Admin Notes:</p>
                      <p className="text-sm text-gray-300">{req.admin_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => sendPaymentEmail(req.user_email, req.requested_plan, req.user_name)}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 text-sm transition"
                    >
                      <Mail className="w-4 h-4" />
                      Send Payment Email
                    </button>
                    
                    <button
                      onClick={() => updateRequestStatus(req.id, "contacted", "Contacted via email with payment details")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-sm transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Mark Contacted
                    </button>
                    
                    <button
                      onClick={() => {
                        upgradeUser(req.user_id, req.requested_plan);
                        updateRequestStatus(req.id, "approved", `Account upgraded to ${req.requested_plan} plan`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve & Upgrade
                    </button>
                    
                    <button
                      onClick={() => updateRequestStatus(req.id, "rejected", "Request rejected")}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === "users" && (
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Plan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Credits Used</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-white/5 hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{user.username}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        {getPlanBadge(user.plan)}
                       </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Daily:</span>
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(user.daily_credits_used / user.daily_limit) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-white">{user.daily_credits_used}/{user.daily_limit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Monthly:</span>
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${(user.monthly_credits_used / user.monthly_limit) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-white">{user.monthly_credits_used}/{user.monthly_limit}</span>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <select
                            onChange={(e) => upgradeUser(user.id, e.target.value)}
                            value={user.plan}
                            disabled={upgrading === user.id}
                            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="free">Free (5/day)</option>
                            <option value="pro">Pro (15/day)</option>
                            <option value="business">Business (40/day)</option>
                          </select>
                          <button
                            onClick={() => resetCredits(user.id)}
                            className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition"
                            title="Reset Credits"
                          >
                            <RefreshCw size={16} className="text-yellow-500" />
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}