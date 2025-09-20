import Logo from "../assets/Logo";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useState } from "react";
import api from "../utils/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ForgetPassword() {
  const [input, setInput] = useState({
    email: "",
  });
  const [otpInput, setOtpInput] = useState("");
  const [passwordInput, setPasswordInput] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { value, name } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleOtpChange = (e) => {
    setOtpInput(e.target.value);
  };

  const handlePasswordChange = (e) => {
    const { value, name } = e.target;
    setPasswordInput((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.email.trim()) {
      setError((prev) => ({ ...prev, email: "Email cannot be empty" }));
      return false;
    } else if (!emailRegex.test(input.email)) {
      setError((prev) => ({ ...prev, email: "Email format is incorrect" }));
      return false;
    }
    return true;
  };

  const validatePasswords = () => {
    let isValid = true;
    if (passwordInput.newPassword.length < 6) {
      setError((prev) => ({
        ...prev,
        newPassword: "Password must be at least 6 characters",
      }));
      isValid = false;
    }
    if (passwordInput.newPassword !== passwordInput.confirmPassword) {
      setError((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsSubmitting(true);
    try {
      await api.post("/api/v1/users/auth/send-otp", { email: input.email });
      toast.success("OTP sent successfully to your email.");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpInput) {
      toast.error("Please enter the OTP.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/v1/users/auth/verify-otp", {
        email: input.email,
        otp: otpInput,
      });
      toast.success("OTP verified successfully!");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setIsSubmitting(true);
    try {
      await api.post("/api/v1/users/auth/reset-password", {
        email: input.email,
        newPassword: passwordInput.newPassword,
      });
      toast.success("Password reset successfully! Redirecting to login.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col mb-4">
              <label htmlFor="email" className="pb-2 font-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="border p-2 rounded-md w-full focus:outline-none"
                placeholder="john@example.com"
                onChange={handleChange}
                name="email"
                value={input.email}
              />
              <span className="text-destructive text-sm">{error.email}</span>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Next"}
            </Button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleOtpSubmit}>
            <div className="flex flex-col mb-4">
              <label htmlFor="otp" className="pb-2 font-semibold">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                className="border p-2 rounded-md w-full focus:outline-none"
                placeholder="Enter OTP"
                onChange={handleOtpChange}
                value={otpInput}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Verify OTP"
              )}
            </Button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col mb-4">
              <label htmlFor="newPassword" className="pb-2 font-semibold">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="border p-2 rounded-md w-full focus:outline-none"
                placeholder="Enter new password"
                name="newPassword"
                onChange={handlePasswordChange}
                value={passwordInput.newPassword}
              />
              <span className="text-destructive text-sm">
                {error.newPassword}
              </span>
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="confirmPassword" className="pb-2 font-semibold">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="border p-2 rounded-md w-full focus:outline-none"
                placeholder="Confirm new password"
                name="confirmPassword"
                onChange={handlePasswordChange}
                value={passwordInput.confirmPassword}
              />
              <span className="text-destructive text-sm">
                {error.confirmPassword}
              </span>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="flex gap-3 m-4 items-center">
          <Logo className="w-10" />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text text-xl sm:text-2xl font-bold">
            InterviewTalent
          </span>
        </div>
        <Card className="w-full">
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold">Forget Password</h2>
            <p className="text-sm text-gray-500">
              {step === 1
                ? "Enter your email to get an OTP"
                : step === 2
                ? "Enter the OTP sent to your email"
                : "Create a new password"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">{renderForm()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
