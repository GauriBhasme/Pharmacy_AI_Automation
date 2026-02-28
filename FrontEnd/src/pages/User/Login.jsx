import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import PrimaryButton from "../../components/auth/PrimaryButton";
// import Divider from "../../components/auth/Divider";

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/login",
                formData,
                {
                    withCredentials: true, // ✅ IMPORTANT for cookies
                }
            );

            console.log("Login Success:", res.data);

            // Save JWT token to localStorage for authenticated requests
            localStorage.setItem("token", res.data.token);

            // Redirect based on role
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
                    />

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <PrimaryButton type="submit" disabled={loading}>
                        {loading ? "Signing In..." : "Sign In"}
                    </PrimaryButton>
                    <p className="text-sm text-center text-[#9FB7C8]">Dont't have account <Link to="/register" className="text-blue-500 hover:underline">Sign Up</Link></p>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}