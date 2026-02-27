import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import PrimaryButton from "../../components/auth/PrimaryButton";
import Divider from "../../components/auth/Divider";

export default function Login() {
  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Please enter your details to sign in."
      >
        <form className="space-y-4">
          <InputField
            label="Email Address"
            type="email"
            placeholder="name@pharmacy.com"
          />

          <InputField
            label="Password"
            type="password"
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

          <PrimaryButton>Sign In</PrimaryButton>
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