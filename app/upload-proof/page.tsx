"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, CheckCircle2, Loader2, ArrowLeft, X } from "lucide-react";

// Component that uses useSearchParams
function UploadProofContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const requestId = searchParams.get("request_id");
  const plan = searchParams.get("plan");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    if (!requestId) {
      toast.error("Invalid upload link");
      router.push("/");
    }
  }, [requestId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleUpload = async () => {
    if (!screenshot) {
      toast.error("Please select a screenshot");
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem("eaglecode_token");
      const formData = new FormData();
      formData.append("request_id", requestId!);
      formData.append("payment_screenshot", screenshot);
      if (user) {
        formData.append("user_id", user.id);
      }

      const response = await fetch(`${backendUrl}/api/upload-payment-proof`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        toast.success("Payment proof uploaded! Admin will review it.");
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Thank You!</h2>
              <p className="text-slate-400">
                Your payment proof has been submitted. Our admin will review it and upgrade your account within 2 hours.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Upload Payment Proof</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Upload screenshot of your payment for {plan?.toUpperCase()} plan
                </p>
              </div>

              <div className="mb-4">
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-cyan-500/50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer block">
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                        <button
                          onClick={() => {
                            setScreenshot(null);
                            setPreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-cyan-400" />
                        </div>
                        <span className="text-sm text-slate-400">Click to upload screenshot</span>
                        <span className="text-xs text-slate-500">PNG, JPG up to 5MB</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!screenshot || isUploading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 text-white font-semibold py-3"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Submit Payment Proof"
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Need help? Contact us at support@eaglecode.com
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page with Suspense boundary
export default function UploadProofPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    }>
      <UploadProofContent />
    </Suspense>
  );
}