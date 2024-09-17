import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import loginImg from "../../assets/login_img.svg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"

export default function Login({ appState, setAppState }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // handles input validation message
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleOnInputChange = (event) => {
    setForm((f) => ({ ...f, [event.target.name]: event.target.value }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await axios.post(
        "http://localhost:3001/auth/login", 
        // "https://my-capstone-backend-02def2333679.herokuapp.com/auth/login", 
        form);
      setErrorMessage("");
      setForm({ email: "", password: "" });
      setAppState((appState) => ({ ...appState, ...result.data }));
      localStorage.setItem("token", result.data.token);
      navigate("/home");
    } catch (error) {
      if (error.code === "ERR_BAD_REQUEST") localStorage.removeItem("token");
      setErrorMessage(error.response.data.message);
      setAppState({
        user: null,
        token: null,
        favorites: [],
        courses: null,
        schedules: [],
        currScheduleId: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-indigo-50 flex w-full flex-col items-center justify-center">
      <div className="flex flex-row justify-center items-center  h-full w-full lg:h-5/6 lg:w-5/6 rounded-lg drop-shadow-[0_0px_20px_rgba(0,0,0,0.25)]">
        <div className="hidden h-full rounded-l-lg w-7/12 bg-indigo-200 lg:flex items-center justify-center">
          <img className="h-2/3" src={loginImg} />
        </div>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white rounded-lg lg:rounded-l-none">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Link to="/">
              {/* Use Link to navigate to the home page */}
              <CalendarDaysIcon className="mx-auto h-10 w-auto text-indigo-600" />
              <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-indigo-600">
                Welcome Back!
              </h2>
            </Link>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-10 relative" onSubmit={handleOnSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-base font-medium leading-6 text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm: sm:leading-6 h-10"
                    placeholder="user@gmail.com"
                    value={form.email}
                    onChange={handleOnInputChange}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-base font-medium leading-6 text-gray-900">
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm: sm:leading-6 h-10"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleOnInputChange}
                  />
                </div>
              </div>

              {errorMessage ? (
                <p className="absolute text-red-600 w-full -py-4">
                  {errorMessage}
                </p>
              ) : null}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 text-base font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 h-10 items-center">
                  {isLoading ? "Loading..." : "Sign in"}
                </button>
              </div>
            </form>

            <p className="mt-10 text-center text-base text-gray-500">
              Don't have an accout? &nbsp;
              <Link
                to="/register"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                Get Started
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
