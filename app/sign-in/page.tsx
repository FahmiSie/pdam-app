"use client";

import { setCookie } from "cookies-next";
import { useState } from "react";
import { Eye, EyeOff, Users, Droplets } from "lucide-react";
import { storeCookie } from "@/lib/client-cookie";

export default function SignInPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "app-key": `${process.env.NEXT_PUBLIC_APP_KEY}`,
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const responseData = await response.json();
      console.log("Full response data:", responseData);

      if (!response.ok) {
        alert(`Gagal login: ${responseData.message || "Username atau password salah"}`);
        return;
      }

      // Set cookie dengan token dari response
      const token = responseData.token || responseData.data?.token;
      setCookie("accessToken", token, {
        maxAge: 60 * 60 * 24, // 1 day
      });

      alert(responseData.message || "Login berhasil!");
      if (responseData.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else if (responseData.role === "CUSTOMER") {
        window.location.href = "/cust/dashboard";
      }
    } catch (error) {
      console.log("error during sign in:", error);
      alert("Terjadi kesalahan saat login: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-md">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PDAM System</h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition-all duration-200 hover:bg-white hover:border-gray-300"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition-all duration-200 hover:bg-white hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <a href="/sign-up" className="text-blue-600 font-semibold hover:underline">
                Create an Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}