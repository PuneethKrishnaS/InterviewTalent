import Logo from "../assets/Logo";
import { Chrome, Eye, EyeOff, Github } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useContext, useState } from "react";
import api from "../utils/axios";
import { toast } from "sonner";
import { AuthContext } from "../components/context/AuthContext";

export default function Login() {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { value, name } = e.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
    setError((prevInput) => ({
      ...prevInput,
      [name]: "",
    }));
  };
  const validateForm = (input) => {
    let newError = {
      email: "",
      password: "",
    };
    const { password, email } = input;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newError.email = "Email can not be empty";
    } else if (!emailRegex.test(email)) {
      newError.email = "Email format is Incorrect";
    }

    if (!password.trim()) {
      newError.password = "Password can not be empty";
    }
    return newError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(input);
    setError(validationErrors);

    const hasErrors = Object.values(validationErrors).some(
      (msg) => msg.trim() !== ""
    );

    if (hasErrors) return;

    login(input.email, input.password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="flex flex-col items-center w-full max-w-md">
        <Link to={"/"}>
          <div className="flex gap-3 m-4 items-center">
            <Logo className="w-10" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text text-xl sm:text-2xl font-bold">
              InterviewTalent
            </span>
          </div>
        </Link>

        <Card className="w-full">
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold">Sign In</h2>
            <p className="text-sm text-gray-500">
              Enter your credentials to access your account
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 ">
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="flex flex-col mb-4">
                  <label htmlFor="email" className="pb-2 font-semibold">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="border p-2 rounded-md w-full focus:outline-none "
                    placeholder="john@example.com"
                    onChange={handleChange}
                    name="email"
                    value={input.email}
                  />
                  <span className="text-destructive  text-sm">
                    {error.email}
                  </span>
                </div>

                {/* Password */}
                <div className="flex flex-col">
                  <label htmlFor="password" className="pb-2 font-semibold">
                    Password
                  </label>
                  <div className="flex border justify-center items-center pr-2 rounded-md ">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="p-2 w-full focus:outline-none"
                      placeholder="Create your Password"
                      onChange={handleChange}
                      name="password"
                      value={input.password}
                    />
                    <div
                      className="cursor-pointer"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>
                  <span className="text-destructive  text-sm">
                    {error.password}
                  </span>
                </div>

                {/* Remember / Forgot */}
                <div className="flex justify-between text-sm my-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox /> Remember me
                  </label>
                  <span className="text-blue-500 cursor-pointer">
                    Forgot password?
                  </span>
                </div>

                <div>
                  <Button
                    type="submit"
                    className={
                      "w-full bg-gradient-to-r from-purple-600 to-blue-600 "
                    }
                  >
                    Login to your Account
                  </Button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social login */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex items-center justify-center gap-2 border-2 rounded-md p-2 w-full">
                  <Chrome /> Google
                </button>
                <button className="flex items-center justify-center gap-2 border-2 rounded-md p-2 w-full">
                  <Github /> GitHub
                </button>
              </div>

              {/* Sign up link */}
              <p className="text-center text-sm mt-4">
                Don't have an account?{" "}
                <Link to={"/signup"}>
                  <span className="font-bold text-blue-600 cursor-pointer">
                    Sign Up
                  </span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
