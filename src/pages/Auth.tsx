import { useState, useEffect, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Home } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type InputType = "email" | "phone" | null;
type Step = "input" | "otp";

const detectInputType = (value: string): InputType => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";
  if (/^\+?[0-9]{10,15}$/.test(trimmed.replace(/[\s-]/g, ""))) return "phone";
  return null;
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/[\s-]/g, "");
  if (!digits.startsWith("+")) return `+91${digits}`;
  return digits;
};

const RESEND_COOLDOWN = 60;

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("input");
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [inputType, setInputType] = useState<InputType>(null);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSignUp, setIsSignUp] = useState(true);

  useEffect(() => {
    setInputType(detectInputType(identifier));
  }, [identifier]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  const sendOtp = async () => {
    if (!inputType) {
      toast({ title: "Invalid input", description: "Enter a valid email or mobile number.", variant: "destructive" });
      return;
    }
    if (isSignUp && !fullName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let error;
      if (inputType === "email") {
        const res = await supabase.auth.signInWithOtp({
          email: identifier.trim(),
          options: {
            shouldCreateUser: isSignUp,
            data: isSignUp ? { full_name: fullName.trim() } : undefined,
          },
        });
        error = res.error;
      } else {
        const phone = formatPhone(identifier);
        const res = await supabase.auth.signInWithOtp({
          phone,
          options: {
            shouldCreateUser: isSignUp,
            data: isSignUp ? { full_name: fullName.trim() } : undefined,
          },
        });
        error = res.error;
      }

      if (error) {
        toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
      } else {
        setStep("otp");
        setResendTimer(RESEND_COOLDOWN);
        toast({
          title: "OTP sent",
          description: inputType === "email"
            ? `Check your inbox at ${identifier.trim()}`
            : `SMS sent to ${formatPhone(identifier)}`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) {
      toast({ title: "Enter complete OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let error;
      if (inputType === "email") {
        const res = await supabase.auth.verifyOtp({
          email: identifier.trim(),
          token: otp,
          type: isSignUp ? "signup" : "email",
        });
        error = res.error;
      } else {
        const res = await supabase.auth.verifyOtp({
          phone: formatPhone(identifier),
          token: otp,
          type: "sms",
        });
        error = res.error;
      }

      if (error) {
        toast({ title: "Verification failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome!", description: "You're signed in." });
        navigate("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp("");
    sendOtp();
  };

  const goBack = () => {
    setStep("input");
    setOtp("");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 relative">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        Home
      </button>

      <div className="mb-8 flex flex-col items-center gap-2">
        <img src={logo} alt="Home Hero logo" className="h-16 w-16 rounded-2xl object-contain" />
        <h1 className="font-display text-2xl font-bold text-foreground">Home Hero</h1>
        <p className="text-sm text-muted-foreground">Your Trusted Service Experts</p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        {step === "input" && (
          <>
            {/* Toggle Sign In / Sign Up */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  isSignUp ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  !isSignUp ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendOtp();
              }}
              className="space-y-4"
            >
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Mobile Number</Label>
                <Input
                  id="identifier"
                  placeholder="you@example.com or mobile number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                {identifier && (
                  <p className="text-xs text-muted-foreground">
                    {inputType === "email"
                      ? "📧 We'll send an OTP to your email"
                      : inputType === "phone"
                      ? "📱 We'll send an OTP via SMS"
                      : "Enter a valid email or 10+ digit phone number"}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !inputType}
              >
                {isSubmitting ? "Sending OTP…" : "Send OTP"}
              </Button>
            </form>
          </>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Enter verification code</h2>
              <p className="text-sm text-muted-foreground">
                Sent to{" "}
                <span className="font-medium text-foreground">
                  {inputType === "email" ? identifier.trim() : formatPhone(identifier)}
                </span>
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyOtp();
              }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || otp.length < 6}
              >
                {isSubmitting ? "Verifying…" : "Verify & Continue"}
              </Button>
            </form>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in <span className="font-medium text-foreground">{resendTimer}s</span>
                </p>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleResend} disabled={isSubmitting}>
                  Resend OTP
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
