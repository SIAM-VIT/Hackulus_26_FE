"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setToken, getToken, removeToken } from "@/lib/auth";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

interface User {
  user_id: number;
  email: string;
  role: "participant" | "judge" | "admin";
  team_id?: number;
  is_leader?: boolean;
  name: string;
  panel_id?: number;
}

interface SignupParams {
  name: string;
  email: string;
  password: string;
  team_name: string;
  track_id: number;
  registration_number: string;
  hostel_block?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (params: SignupParams) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const decodedToken: { role?: string } = jwtDecode(storedToken);

          let response;
          if (
            decodedToken.role === "judge" ||
            decodedToken.role === "admin"
          ) {
            response = await api.get("/auth/me");
            setUser(response.data);
            setIsAdmin(true);
          } else {
            response = await api.get("/users/home");
            setUser(response.data.user);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Session expired or token is invalid.", error);
          removeToken();
          setTokenState(null);
          setUser(null);
          setIsAdmin(false);
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/user/login", { email, password });
      const { access_token: newToken } = response.data;

      setToken(newToken);
      setTokenState(newToken);

      const decodedToken: { role?: string } = jwtDecode(newToken);
      const isAttemptingAdminLogin = decodedToken.role === "admin" || decodedToken.role === "judge";

      if (isAttemptingAdminLogin) {
        const adminProfileRes = await api.get("/auth/me");
        setUser(adminProfileRes.data);
        setIsAdmin(true);
        router.push("/admin");
      } else {
        const userProfileRes = await api.get("/users/home");
        setUser(userProfileRes.data.user);
        setIsAdmin(false);
        router.push("/dashboard");
      }
      toast.success("Login Successful!");
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = (error as any).response?.data;
      let errorMessage = "Login failed. Please try again.";
      if (errorData) {
        if (typeof errorData.detail === "string") errorMessage = errorData.detail;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (Array.isArray(errorData.detail)) errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
        else if (errorData.message) errorMessage = errorData.message;
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signup = async (params: SignupParams) => {
    try {
      const payload = {
        name: params.name,
        email: params.email,
        password: params.password,
        team_name: params.team_name,
        track_id: params.track_id,
        is_leader: true,
        extra_info: {
          registration_number: params.registration_number,
          hostel_block: params.hostel_block || "",
        },
      };

      const response = await api.post("/auth/user/signup", payload);
      const { access_token: newToken } = response.data;

      setToken(newToken);
      setTokenState(newToken);

      const userProfileRes = await api.get("/users/home");
      setUser(userProfileRes.data.user);
      setIsAdmin(false);
      toast.success("Registration Successful! Welcome to Hackulus.");
      router.push("/dashboard");
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = (error as any).response?.data;
      let errorMessage = "Signup failed. Please check your details.";
      if (errorData) {
        if (typeof errorData.detail === "string") errorMessage = errorData.detail;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (Array.isArray(errorData.detail)) errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
        else if (errorData.message) errorMessage = errorData.message;
      }
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    setIsAdmin(false);
    toast.info("You have been logged out.");
    router.push("/");
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    isAdmin,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
