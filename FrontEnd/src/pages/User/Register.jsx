import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import PrimaryButton from "../../components/auth/PrimaryButton";

export default function Register() {
  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        subtitle="Start optimizing your workflow with Pharmacy AI today."
      >
        <form className="space-y-4">
          <InputField
            label="Full Name"
            placeholder="John Doe"
          />

          <InputField
            label="Email Address"
            type="email"
            placeholder="name@pharmacy.com"
          />

          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
          />

          <InputField
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
          />

          <PrimaryButton>Create Account</PrimaryButton>
        </form>

        <p className="text-[#9FB7C8] text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#5F8FA8] hover:underline">
            Back to Login
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}