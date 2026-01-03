import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasNavigated = useRef(false);

  useEffect(() => {
    const inRoleSelection = sessionStorage.getItem("inRoleSelection");
    if (user && inRoleSelection !== "true" && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (phoneNumber.length < 10) {
      toast.error("Enter valid phone number");
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      // For test phone numbers, Firebase doesn't need recaptcha
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        })
      );

      setVerificationId(confirmationResult.verificationId);
      setShowOtpInput(true);
      toast.success("OTP sent!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Verify the OTP with Firebase
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);

      console.log("Firebase login successful, user:", result.user);

      // Store the formatted phone number for later use
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;
      sessionStorage.setItem("userPhoneNumber", formattedPhone);

      const token = await result.user.getIdToken();

      const loginRes = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5002/api"
        }/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        }
      );

      const loginData = await loginRes.json();

      if (loginData.success && loginData.user) {
        sessionStorage.removeItem("userPhoneNumber");
        sessionStorage.removeItem("inRoleSelection");
        sessionStorage.removeItem("selectedRole");

        toast.success(
          `Welcome back! You're registered as a ${loginData.user.role}.`
        );
        setLoading(false);

        // Navigate directly - user is already set by backend
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
        return;
      }

      console.log("🆕 New user detected, showing role selection");
      sessionStorage.setItem("inRoleSelection", "true");
      setShowRoleSelection(true);
      setLoading(false);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Invalid OTP, try again");
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Select a role");
      return;
    }

    setLoading(true);
    toast.success("Setting up your account...");

    // Force a token refresh to trigger onAuthStateChanged
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      const token = await currentUser.getIdToken(true); // Force refresh
      console.log("Token refreshed for UID:", currentUser.uid);

      const storedPhone =
        sessionStorage.getItem("userPhoneNumber") ||
        currentUser.phoneNumber ||
        phoneNumber;

      console.log("Sending registration request:");
      console.log("UID:", currentUser.uid);
      console.log("Phone:", storedPhone);
      console.log("Role:", selectedRole);

      // Manually trigger backend registration
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5002/api"
        }/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uid: currentUser.uid,
            phoneNumber: storedPhone,
            role: selectedRole,
          }),
        }
      );

      const data = await response.json();
      console.log("Backend registration response:", data);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(
          data.message || `Server responded with ${response.status}`
        );
      }

      if (data.success) {
        sessionStorage.removeItem("selectedRole");
        sessionStorage.removeItem("userPhoneNumber");
        sessionStorage.removeItem("inRoleSelection");

        // Check if user already had a different role
        if (data.user.role !== selectedRole) {
          console.log("User already has role:", data.user.role);
          toast.dismiss();
          toast.info(
            `You're already registered as a ${data.user.role}. Redirecting...`
          );
        } else {
          toast.dismiss();
          toast.success("Account created!");
        }

        // Force token refresh to trigger AuthContext update
        await currentUser.getIdToken(true);

        // Navigate after a short delay to ensure AuthContext processes
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 800);
      } else {
        console.error("Registration failed with data:", data);
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error completing registration:", error);
      toast.dismiss();
      toast.error(error.message || "Registration failed");
      setLoading(false);
    }
  };

  const handleRequestCall = () => {
    toast.info("Voice call feature coming soon!");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome</h1>
        <p>Login with your phone number</p>

        {!showOtpInput ? (
          <form onSubmit={handleSendOTP}>
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <small>Include country code (e.g., +1 for US)</small>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : !showRoleSelection ? (
          <form onSubmit={handleVerifyOTP}>
            <div className="input-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="000000"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRequestCall}
            >
              Request Voice Call Instead
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setShowOtpInput(false);
                setOtp("");
                setVerificationId("");
                // Clear recaptcha when changing phone number
                if (window.recaptchaVerifier) {
                  try {
                    window.recaptchaVerifier.clear();
                  } catch (error) {
                    console.log("Error clearing recaptcha:", error);
                  }
                  window.recaptchaVerifier = null;
                }
              }}
            >
              Change Phone Number
            </button>
          </form>
        ) : (
          <form onSubmit={handleCompleteRegistration}>
            <div className="role-selection">
              <h3>Select Your Role</h3>
              <p>Choose how you want to use the platform</p>

              <div className="role-options">
                <div
                  className={`role-card ${
                    selectedRole === "provider" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedRole("provider")}
                >
                  <div className="role-icon">🏢</div>
                  <h4>Service Provider</h4>
                  <p>Create and manage time slots for your services</p>
                </div>

                <div
                  className={`role-card ${
                    selectedRole === "customer" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedRole("customer")}
                >
                  <div className="role-icon">👤</div>
                  <h4>Customer</h4>
                  <p>Browse and book available time slots</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedRole || loading}
            >
              {loading ? "Completing..." : "Complete Registration"}
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setShowRoleSelection(false);
                setSelectedRole("");
              }}
            >
              Go Back
            </button>
          </form>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default Login;
