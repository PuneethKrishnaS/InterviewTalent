import Logo from "../assets/Logo";
import {
  CheckCircle2Icon,
  Chrome,
  Cookie,
  Eye,
  EyeOff,
  Github,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useContext, useState } from "react";
import api from "../utils/axios";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { toast, Toaster } from "sonner";
import { AuthContext } from "../components/context/AuthContext";

export default function Signup() {
  const [input, setInput] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const [error, setError] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { signup } = useContext(AuthContext);

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
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmpassword: "",
    };
    const { firstname, password, confirmpassword, email } = input;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?!.*\s).{8,}$/;

    if (!firstname.trim()) {
      newError.firstname = "Username can not be empty";
    }

    if (!email.trim()) {
      newError.email = "Email can not be empty";
    } else if (!emailRegex.test(email)) {
      newError.email = "Email format is Incorrect";
    }

    if (!password.trim()) {
      newError.password = "Password can not be empty";
    } else if (!strongPasswordRegex.test(password)) {
      newError.password = "Password must be Strong";
    }
    if (!confirmpassword.trim()) {
      newError.confirmpassword = "Confirm Password can not be empty";
    } else if (confirmpassword.trim() !== password.trim()) {
      newError.confirmpassword = "Password dosn't match";
    }
    return newError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(input);
    setError(validationErrors);

    // Check if any field in validationErrors has a truthy value
    const hasErrors = Object.values(validationErrors).some(
      (msg) => msg.trim() !== ""
    );

    if (hasErrors) return;

    signup({
      userName: {
        first: input.firstname,
        last: input.lastname,
      },
      email: input.email,
      password: input.password,
    });
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
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="text-sm text-gray-500">
              Start your interview preparation journey today
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <form onSubmit={handleSubmit}>
                {/* Name fields */}
                <div className="flex flex-col sm:flex-row gap-4 w-full md:mb-4 ">
                  <div className="flex flex-col w-full ">
                    <label htmlFor="firstName" className="pb-2 font-semibold">
                      First name*
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className="border p-2 rounded-md w-full focus:outline-none"
                      placeholder="John"
                      onChange={handleChange}
                      name="firstname"
                      value={input.firstname}
                    />
                    <span className="text-destructive text-sm">
                      {error.firstname}
                    </span>
                  </div>
                  <div className="flex flex-col w-full ">
                    <label htmlFor="lastName" className="pb-2 font-semibold">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className="border p-2 rounded-md w-full focus:outline-none"
                      placeholder="Doe"
                      onChange={handleChange}
                      name="lastname"
                      value={input.lastname}
                    />
                  </div>
                  <span className="text-destructive  text-sm">
                    {error.lastname}
                  </span>
                </div>

                {/* Email */}
                <div className="flex flex-col mb-4">
                  <label htmlFor="email" className="pb-2 font-semibold">
                    Email*
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
                <div className="flex flex-col mb-4">
                  <label htmlFor="password" className="pb-2 font-semibold">
                    Create password*
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

                {/* Confirm password */}
                <div className="flex flex-col mb-4">
                  <label
                    htmlFor="confirmPassword"
                    className="pb-2 font-semibold"
                  >
                    Confirm password*
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="border p-2 rounded-md w-full focus:outline-none"
                    placeholder="Confirm your Password"
                    onChange={handleChange}
                    name="confirmpassword"
                    value={input.confirmpassword}
                  />
                  <span className="text-destructive  text-sm">
                    {error.confirmpassword}
                  </span>
                </div>

                <div>
                  <Button
                    type="submit"
                    className={
                      "w-full bg-gradient-to-r from-purple-600 to-blue-600 "
                    }
                  >
                    Create Account
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
                <Button
                  className="flex items-center justify-center gap-2 border-2 rounded-md p-2 w-full"
                  disabled
                >
                  <Chrome /> Google
                </Button>
                <Button
                  className="flex items-center justify-center gap-2 border-2 rounded-md p-2 w-full cursor-pointer bg-background text-foreground hover:bg-popover hover:text-foreground"
                  onClick={() =>
                    (window.location.href =
                      import.meta.env.VITE_ENV === "production"
                        ? `${
                            import.meta.env.VITE_BACKEND_URL
                          }/api/v1/users/auth/github`
                        : "http://localhost:8000/api/v1/users/auth/github")
                  }
                >
                  <Github /> GitHub
                </Button>
              </div>


              {/* Sign up link */}
              <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <Link to={"/login"}>
                  <span className="font-bold text-blue-600 cursor-pointer">
                    LogIn
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
