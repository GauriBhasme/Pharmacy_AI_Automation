import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import PrimaryButton from "../../components/auth/PrimaryButton";
import Divider from "../../components/auth/Divider";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
        {
          withCredentials: true, // IMPORTANT for cookies
        }
      );

      console.log("Login Success:", res.data);

      // Redirect based on role (optional)
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Please enter your details to sign in."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@pharmacy.com"
          />

          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            rightElement={
              <span className="text-[#5F8FA8] text-xs cursor-pointer">
                Forgot password?
              </span>
            }
          />

          <div className="flex items-center gap-2 text-[#9FB7C8] text-sm">
            <input type="checkbox" className="accent-[#135C8C]" />
            Stay signed in for 30 days
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </PrimaryButton>
        </form>

        <Divider />

        <div className="flex gap-4">
          <button className="flex-1 py-2 border border-[#135C8C] rounded-lg text-[#9FB7C8] hover:bg-[#0E2F5A]">
            Google
          </button>
          <button className="flex-1 py-2 border border-[#135C8C] rounded-lg text-[#9FB7C8] hover:bg-[#0E2F5A]">
            Apple
          </button>
        </div>

        <p className="text-[#9FB7C8] text-sm text-center mt-6">
          New to the platform?{" "}
          <Link to="/register" className="text-[#5F8FA8] hover:underline">
            Create an account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}