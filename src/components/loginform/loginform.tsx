"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from "js-cookie";
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/context/TokenProvider';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setToken, setIsAuthenticated, setUser } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check if input is an email or username
    const isEmail = formData.email.includes("@"); // Check for '@' to determine email

    const payload = isEmail
      ? { email: formData.email, password: formData.password } // Login with email
      : { username: formData.email, password: formData.password }; // Login with username

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response data:", data); // 🔍 Debug response

      if (!response.ok) {
        throw new Error(data.message || "Invalid Credentials");
      }

      // ✅ Store token and user data
      setToken(data.token);
      setIsAuthenticated(true);
      setUser(data.user);

      Cookies.set("token", data.token, { expires: 7 });
      Cookies.set("user", JSON.stringify(data.user), { expires: 7 });

      router.push("/chatspace"); // Redirect after login
    } catch (err: any) {
      console.log("Error caught:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-900 px-6 py-10 sm:p-10 rounded-xl shadow-2xl w-full max-w-md space-y-8 mt-6">
        <div className="relative text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text drop-shadow-xl tracking-tight leading-snug sm:leading-tight mb-6 sm:mb-8">
            Welcome Back!<br className="hidden md:block" /> Ready to Dive In?
          </h2>

          <svg
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-32 sm:w-44 md:w-56 h-6 text-pink-500 animate-bounce"
            viewBox="0 0 200 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 20C30 5 70 30 100 10C130 -10 170 30 195 5"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {error && <div className="text-center text-red-500 dark:text-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Username */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email / Username
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white py-3 sm:py-4 rounded-lg shadow-lg hover:from-indigo-500 hover:to-purple-500 transition duration-300 transform hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Sign Up Link */}
          <div className="text-center text-sm pt-2">
            <span className="text-gray-700 dark:text-gray-300">Don't have an account? </span>
            <span
              onClick={() => router.push("/signin")}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Sign Up
            </span>
          </div>
        </form>
      </div>
    </div>

  );

};

export default Login;
