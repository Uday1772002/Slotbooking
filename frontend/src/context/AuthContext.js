import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
} from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);
  const isFetching = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const inRoleSelection = sessionStorage.getItem("inRoleSelection");
          if (inRoleSelection === "true") {
            setLoading(false);
            return;
          }

          if (isInitialized.current || isFetching.current) {
            setLoading(false);
            return;
          }

          isFetching.current = true;
          const token = await firebaseUser.getIdToken();

          try {
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

            if (!loginData.success) {
              throw new Error("Login failed");
            }

            if (loginData.user) {
              const newUserData = {
                uid: firebaseUser.uid,
                phoneNumber: firebaseUser.phoneNumber,
                role: loginData.user.role,
                name: loginData.user.name || "",
              };

              if (
                !isInitialized.current ||
                !user ||
                user.uid !== newUserData.uid ||
                user.role !== newUserData.role
              ) {
                setUser(newUserData);
                isInitialized.current = true;
              }

              isFetching.current = false;
              setLoading(false);
              return;
            }
          } catch (loginError) {
            console.log("Login failed:", loginError);
            isFetching.current = false;
          }

          const selectedRole = sessionStorage.getItem("selectedRole");

          if (!selectedRole) {
            isFetching.current = false;
            setLoading(false);
            return;
          }

          const phoneNumber =
            firebaseUser.phoneNumber ||
            sessionStorage.getItem("userPhoneNumber");

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
              credentials: "include",
              body: JSON.stringify({
                uid: firebaseUser.uid,
                phoneNumber: phoneNumber,
                role: selectedRole,
              }),
            }
          );

          const data = await response.json();
          sessionStorage.removeItem("selectedRole");

          if (data.success && data.user) {
            setUser({
              uid: firebaseUser.uid,
              phoneNumber: firebaseUser.phoneNumber,
              role: data.user.role,
              name: data.user.name || "",
            });
            isInitialized.current = true;
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error(
            "Auth error:",
            error.response?.data?.message || error.message
          );

          if (error.response?.data?.message?.includes("role")) {
            setLoading(false);
            return;
          }

          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        isInitialized.current = false;
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
