"use client";

import { useState, useEffect } from "react";
import { Mail, CheckCircle, XCircle, Phone, MessageSquare, ExternalLink, Loader2 } from "lucide-react";

interface UpgradeRequest {
  id: string;
  user_email: string;
  user_name: string;
  requested_plan: string;
  message: string;
  status: string;
  admin_notes: string;
  created_at: string;
}

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("eaglecode_token");
      const response = await fetch("http://localhost:8000/api/admin/upgrade-requests", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    setUpdating(requestId);
    try {
      const token = localStorage.getItem("eaglecode_token");
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
        await fetchRequests();
      }
    } catch (error) {
      console.error("Failed to update request:", error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Rejected</span>;
      case "contacted":
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Contacted</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upgrade Requests</h1>
          <p className="text-slate-400">Manage user upgrade requests and contact them with payment details</p>
        </div>

        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{req.user_name || req.user_email}</h3>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-sm text-slate-400">{req.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">{new Date(req.created_at).toLocaleString()}</p>
                  <p className="text-xs text-cyan-400 mt-1">Requested: {req.requested_plan.toUpperCase()}</p>
                </div>
              </div>

              {req.message && (
                <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-slate-300">{req.message}</p>
                </div>
              )}

              {req.admin_notes && (
                <div className="bg-cyan-500/10 rounded-lg p-3 mb-4 border border-cyan-500/20">
                  <p className="text-xs text-cyan-400 mb-1">Admin Notes:</p>
                  <p className="text-sm text-slate-300">{req.admin_notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = `mailto:${req.user_email}?subject=EagleCode%20Upgrade%20Request%20-%20${req.requested_plan.toUpperCase()}%20Plan&body=Hi,%0A%0AThank you for your interest in upgrading to the ${req.requested_plan.toUpperCase()} plan.%0A%0APayment details:%0A- Bank Transfer: ...%0A- Crypto: ...%0A%0APlease complete payment and we'll upgrade your account immediately.%0A%0ABest regards,%0AEagleCode Team`}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 text-sm transition"
                >
                  <Mail className="w-4 h-4" />
                  Send Payment Email
                </button>
                
                <button
                  onClick={() => updateRequestStatus(req.id, "contacted", "Contacted via email with payment details")}
                  disabled={updating === req.id}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-sm transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  Mark Contacted
                </button>
                
                <button
                  onClick={() => updateRequestStatus(req.id, "approved", "Account upgraded to " + req.requested_plan)}
                  disabled={updating === req.id}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve & Upgrade
                </button>
                
                <button
                  onClick={() => updateRequestStatus(req.id, "rejected", "Request rejected")}
                  disabled={updating === req.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No upgrade requests yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}