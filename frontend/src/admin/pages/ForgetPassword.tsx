import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import apiClient from "../../../src/services/apiClient";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetTokenId, setResetTokenId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5-minute countdown clock

  // Start the ticking countdown block only during the entry verification phase (Step 2)
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // STEP 1: REQUEST OTP FOR VERIFIED EMAIL
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // ✅ CHANGED: Using apiClient with unified route endpoint
      const data: any = await apiClient.post("/auth/forgot-password", {
        email,
      });

      setResetTokenId(data.resetTokenId);
      setMessage(
        data.message || "Verification OTP has been dispatched to your inbox."
      );
      setTimer(300); // Ensure timer starts fresh at 5 minutes
      setStep(2); // Progress screen transition automatically
    } catch (err: any) {
      // ✅ The interceptor unpacks the exact backend error message securely
      setError(err.message || "Processing failed");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: SUBMIT PASSKEY VALIDATION AND COMMIT PASSWORD OVERRIDE
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ CHANGED: Using apiClient pointing to the stateless verification route map
      const data: any = await apiClient.post("/auth/verify-otp-reset", {
        resetTokenId,
        otp,
        newPassword,
      });

      setMessage(
        data.message ||
          "Password updated completely! Redirecting back to login gate..."
      );
      setTimeout(() => {
        navigate("/admin/login"); // Return back to standard root control panel path cleanly
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Account Recovery</h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1
              ? "Enter your email to receive an authorization code."
              : "Enter the 6-digit code sent to your inbox."}
          </p>
        </div>

        {message && (
          <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-200">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <Input
              label="Admin Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@studio.com"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Sending Verification Code..."
                : "Send Verification Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Input
                label="6-Digit Verification OTP"
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="font-mono text-center tracking-widest text-lg"
                placeholder="000000"
              />
              <div className="mt-2 text-right">
                {timer > 0 ? (
                  <p className="text-xs text-amber-600 font-medium">
                    Code expires in: {formatTime(timer)}
                  </p>
                ) : (
                  <p className="text-xs text-red-500 font-semibold">
                    Code has expired. Please reload page.
                  </p>
                )}
              </div>
            </div>

            <Input
              label="New Secure Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading || timer === 0}
            >
              {loading ? "Committing Overrides..." : "Verify & Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
