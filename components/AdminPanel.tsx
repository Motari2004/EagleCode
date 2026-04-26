"use client";

import { useState, useEffect } from "react";
import { Shield, Crown, RefreshCw, Zap, Users, Star, Mail, CheckCircle, XCircle, MessageSquare, Clock, Menu, X, Trash2, Image, Eye, Download,Link } from "lucide-react";
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
  payment_screenshot_url?: string;
  payment_amount?: string;
  payment_date?: string;
  email_sent?: boolean;  // ✅ NEW
  email_sent_at?: string;  // ✅ NEW
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "requests">("requests");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<string | null>(null);
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://eaglecode2-2.onrender.com';
  
  const token = typeof window !== 'undefined' ? localStorage.getItem("eaglecode_token") : null;

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users`, {
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
      const response = await fetch(`${backendUrl}/api/admin/upgrade-requests`, {
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
      const response = await fetch(`${backendUrl}/api/admin/upgrade-user`, {
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
      const response = await fetch(`${backendUrl}/api/admin/reset-credits`, {
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
      const response = await fetch(`${backendUrl}/api/admin/update-request-status`, {
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

  // ✅ NEW: Delete request function
  const deleteRequest = async (requestId: string) => {
    setDeletingRequest(requestId);
    try {
      const response = await fetch(`${backendUrl}/api/admin/delete-request/${requestId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Request deleted successfully!");
        await loadUpgradeRequests();
      } else {
        toast.error("Failed to delete request");
      }
    } catch (error) {
      toast.error("Failed to delete request");
    } finally {
      setDeletingRequest(null);
    }
  };

  const getPlanBadge = (plan: string) => {
    switch(plan) {
      case "pro":
        return <span className="px-2 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-[10px] sm:text-xs font-bold text-white">PRO</span>;
      case "business":
        return <span className="px-2 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-[10px] sm:text-xs font-bold text-white">BIZ</span>;
      default:
        return <span className="px-2 py-0.5 sm:px-2 sm:py-1 bg-gray-600 rounded-full text-[10px] sm:text-xs font-bold text-white">FREE</span>;
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch(status) {
      case "approved":
        return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] sm:text-xs">✓ Approved</span>;
      case "rejected":
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[10px] sm:text-xs">✗ Rejected</span>;
      case "contacted":
        return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] sm:text-xs">📧 Contacted</span>;
      default:
        return <span className="px-2 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-[10px] sm:text-xs">⏳ Pending</span>;
    }
  };













  
  const sendPaymentEmail = async (email: string, plan: string, userName: string, requestId: string) => {
  const subject = `EagleCode Upgrade Request - ${plan.toUpperCase()} Plan`;
  const uploadLink = `${window.location.origin}/upload-proof?request_id=${requestId}&plan=${plan}`;
  
  const body = `Hi ${userName || email.split('@')[0]},

Thank you for your interest in upgrading to the ${plan.toUpperCase()} plan!

💰 Payment Options:

📱 M-Pesa (Kenya):
   Number: 0716594620

🪙 Cryptocurrency:
   USDT (TRC20): TPRfXztUWAQfcqaCRqXz3fTAUPNLWXSFi9

📸 AFTER MAKING PAYMENT, UPLOAD YOUR PROOF HERE:
${uploadLink}

We'll upgrade your account within 2 hours of receiving your payment proof.

Best regards,
EagleCode Team`;

  // First, mark email as sent in database
  try {
    console.log("📧 Marking email as sent for request:", requestId);
    
    const response = await fetch(`${backendUrl}/api/admin/send-payment-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ request_id: requestId })
    });
    
    const data = await response.json();
    console.log("📧 API Response:", data);
    
    if (response.ok && data.success) {
      console.log("✅ Email marked as sent in database");
      toast.success("Email status updated!");
      await loadUpgradeRequests(); // Refresh the list
      
      // Then open email client
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      console.error("❌ Failed to mark email as sent:", data);
      toast.error("Failed to update email status");
      // Still open email even if status update fails
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  } catch (error) {
    console.error("❌ Error marking email as sent:", error);
    toast.error("Failed to update email status");
    // Still open email
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
};











  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center">
          <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Access Required</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            <h1 className="text-xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
          </div>
          <p className="text-xs sm:text-sm text-gray-400">Manage users, plans, and upgrade requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/5 rounded-xl p-3 sm:p-6 border border-white/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500" />
              <div>
                <p className="text-[10px] sm:text-sm text-gray-400">Total Users</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 sm:p-6 border border-white/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Star className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-500" />
              <div>
                <p className="text-[10px] sm:text-sm text-gray-400">Pro Users</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{users.filter(u => u.plan === "pro").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 sm:p-6 border border-white/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Zap className="w-5 h-5 sm:w-8 sm:h-8 text-purple-500" />
              <div>
                <p className="text-[10px] sm:text-sm text-gray-400">Business</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{users.filter(u => u.plan === "business").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 sm:p-6 border border-white/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Mail className="w-5 h-5 sm:w-8 sm:h-8 text-cyan-500" />
              <div>
                <p className="text-[10px] sm:text-sm text-gray-400">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{upgradeRequests.filter(r => r.status === "pending").length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tabs Dropdown */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              {activeTab === "requests" ? (
                <Mail className="w-4 h-4 text-cyan-400" />
              ) : (
                <Users className="w-4 h-4 text-cyan-400" />
              )}
              <span className="text-white font-medium">
                {activeTab === "requests" ? "Upgrade Requests" : "Users Management"}
              </span>
              {activeTab === "requests" && upgradeRequests.filter(r => r.status === "pending").length > 0 && (
                <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-[10px] font-bold">
                  {upgradeRequests.filter(r => r.status === "pending").length}
                </span>
              )}
            </div>
            <div className={`transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`}>
              {mobileMenuOpen ? (
                <X size={18} className="text-cyan-400" />
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </button>
          
          {mobileMenuOpen && (
            <div className="mt-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  setActiveTab("requests");
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 ${
                  activeTab === "requests" 
                    ? "bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 border-l-2 border-cyan-400" 
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <Mail className={`w-4 h-4 ${activeTab === "requests" ? "text-cyan-400" : "text-gray-500"}`} />
                <span className="flex-1 text-sm font-medium">Upgrade Requests</span>
                {upgradeRequests.filter(r => r.status === "pending").length > 0 && (
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-[10px] font-bold">
                    {upgradeRequests.filter(r => r.status === "pending").length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => {
                  setActiveTab("users");
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 border-t border-white/10 ${
                  activeTab === "users" 
                    ? "bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 border-l-2 border-cyan-400" 
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <Users className={`w-4 h-4 ${activeTab === "users" ? "text-cyan-400" : "text-gray-500"}`} />
                <span className="flex-1 text-sm font-medium">Users Management</span>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[10px] font-bold">
                  {users.length}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === "requests"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Upgrade Requests ({upgradeRequests.filter(r => r.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === "users"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Users Management
          </button>
        </div>

        {/* Upgrade Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-3 sm:space-y-4">
            {upgradeRequests.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-white/5 rounded-xl border border-white/10">
                <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-2 sm:mb-3" />
                <p className="text-sm sm:text-base text-gray-400">No upgrade requests yet</p>
              </div>
            ) : (
              upgradeRequests.map((req) => (
                <div key={req.id} className="bg-white/5 rounded-xl border border-white/10 p-4 sm:p-6">
                  {/* Header with Delete Button */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1">














                      
                      <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white">{req.user_name || req.user_email}</h3>
                        {getRequestStatusBadge(req.status)}











                      {/* Email Status Badge */}
  {req.email_sent ? (

    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[10px] flex items-center gap-1">
  <Mail size={25} />
  Email Sent
</span>



  ) : (
    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-[10px] flex items-center gap-1">
      <Clock size={25} />
      Email Not Sent
    </span>
  )}










                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 break-all">{req.user_email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] sm:text-sm text-gray-500">{new Date(req.created_at).toLocaleString()}</p>
                        <p className="text-[10px] sm:text-xs text-cyan-400 mt-1">Requested: {req.requested_plan.toUpperCase()}</p>
                      </div>
                      {/* ✅ DELETE BUTTON */}
                      <button
                        onClick={() => deleteRequest(req.id)}
                        disabled={deletingRequest === req.id}
                        className="p-1.5 sm:p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition text-red-400"
                        title="Delete Request"
                      >
                        {deletingRequest === req.id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                  </div>






                  {/* Payment Screenshot - Styled based on availability */}
<div className="mb-3 sm:mb-4">
  {req.payment_screenshot_url ? (
    // ✅ Screenshot UPLOADED - Green/Success style
    <div className="flex items-center justify-between bg-green-500/10 rounded-lg p-2 sm:p-3 border border-green-500/30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-green-400">Screenshot Received</p>
          <p className="text-[10px] text-green-400/70">Payment proof uploaded</p>
        </div>
      </div>
      <button
        onClick={() => setSelectedScreenshot(req.payment_screenshot_url!)}
        className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-xs sm:text-sm transition group"
      >
        <Eye size={14} className="group-hover:scale-110 transition" />
        <span>View Screenshot</span>
      </button>
    </div>
  ) : (
    // ⏳ Screenshot NOT YET UPLOADED - Warning/Yellow style
    <div className="flex items-center justify-between bg-yellow-500/10 rounded-lg p-2 sm:p-3 border border-yellow-500/30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <Clock className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-yellow-400">Awaiting Screenshot</p>
          <p className="text-[10px] text-yellow-400/70">User hasn't uploaded payment proof yet</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const uploadLink = `${window.location.origin}/upload-proof?request_id=${req.id}&plan=${req.requested_plan}`;
            navigator.clipboard.writeText(uploadLink);
            toast.success("Upload link copied to clipboard!");
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 text-xs transition"
        >
          <Link size={12} />
          <span>Copy Link</span>
        </button>
        <span className="text-[10px] text-yellow-400/50">Waiting for upload</span>
      </div>
    </div>
  )}
</div>








                  {/* Message */}
                  {req.message && (
                    <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm text-gray-300 break-words">{req.message}</p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {req.admin_notes && (
                    <div className="bg-cyan-500/10 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 border border-cyan-500/20">
                      <p className="text-[10px] sm:text-xs text-cyan-400 mb-1">Admin Notes:</p>
                      <p className="text-xs sm:text-sm text-gray-300 break-words">{req.admin_notes}</p>
                    </div>
                  )}





                {/* Action Buttons - Email button ALWAYS works */}
<div className="flex flex-wrap gap-2 sm:gap-3">
  {/* Send Email Button - Always clickable, just shows status badge */}
  <button
    onClick={() => sendPaymentEmail(req.user_email, req.requested_plan, req.user_name, req.id)}
    disabled={sendingEmail === req.id}
    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm transition whitespace-nowrap ${
      sendingEmail === req.id
        ? "bg-gray-500/20 text-gray-400 cursor-wait"
        : req.email_sent
          ? "bg-green-500/20 hover:bg-green-500/30 text-green-400"
          : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
    }`}
  >
    {sendingEmail === req.id ? (
      <>
        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
        <span>Sending...</span>
      </>
    ) : req.email_sent ? (
      <>
        <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>Send Email Again</span>
      </>
    ) : (
      <>
        <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>Send Email</span>
      </>
    )}
  </button>

  <button
    onClick={() => updateRequestStatus(req.id, "contacted", "Contacted via email with payment details")}
    className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-[11px] sm:text-sm transition whitespace-nowrap"
  >
    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
    <span>Contacted</span>
  </button>
  
  <button
    onClick={() => {
      upgradeUser(req.user_id, req.requested_plan);
      updateRequestStatus(req.id, "approved", `Account upgraded to ${req.requested_plan} plan`);
    }}
    className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-[11px] sm:text-sm transition whitespace-nowrap"
  >
    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
    <span>Approve</span>
  </button>
  
  <button
    onClick={() => updateRequestStatus(req.id, "rejected", "Request rejected")}
    className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-[11px] sm:text-sm transition whitespace-nowrap"
  >
    <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
    <span>Reject</span>
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
              <table className="min-w-[600px] sm:min-w-full w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">User</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Plan</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Credits Used</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-white/5 hover:bg-white/5 transition">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="font-medium text-white text-sm sm:text-base">{user.username}</p>
                          <p className="text-[10px] sm:text-sm text-gray-400 break-all">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {getPlanBadge(user.plan)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="space-y-1 min-w-[120px]">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-[9px] sm:text-xs text-gray-400">Daily:</span>
                            <div className="flex-1 h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(user.daily_credits_used / user.daily_limit) * 100}%` }}
                              />
                            </div>
                            <span className="text-[9px] sm:text-xs text-white">{user.daily_credits_used}/{user.daily_limit}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-[9px] sm:text-xs text-gray-400">Monthly:</span>
                            <div className="flex-1 h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${(user.monthly_credits_used / user.monthly_limit) * 100}%` }}
                              />
                            </div>
                            <span className="text-[9px] sm:text-xs text-white">{user.monthly_credits_used}/{user.monthly_limit}</span>
                          </div>
                        </div>
                       </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            onChange={(e) => upgradeUser(user.id, e.target.value)}
                            value={user.plan}
                            disabled={upgrading === user.id}
                            className="px-2 sm:px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-[10px] sm:text-sm text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="business">Biz</option>
                          </select>
                          <button
                            onClick={() => resetCredits(user.id)}
                            className="p-1.5 sm:p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition"
                            title="Reset Credits"
                          >
                            <RefreshCw size={14} className="sm:w-4 sm:h-4 text-yellow-500" />
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

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[90vh] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition z-10"
            >
              <X size={20} />
            </button>
            <img 
              src={selectedScreenshot} 
              alt="Payment Screenshot" 
              className="max-w-full max-h-[85vh] object-contain"
            />
            <div className="p-3 bg-slate-900/90 border-t border-white/10 flex justify-between items-center">
              <p className="text-xs text-gray-400">Payment Proof Screenshot</p>
              <a 
                href={selectedScreenshot} 
                download="payment-screenshot.png"
                className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 text-xs transition"
              >
                <Download size={14} />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}