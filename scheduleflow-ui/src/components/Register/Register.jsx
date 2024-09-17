import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import regImg from "../../assets/login_img.svg";
import axios from "axios";

export default function Register({ appState, setAppState }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // handles input validation message
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
    photo: null,
    // agreeToTerms: false,
  });

  const handleOnInputChange = (event) => {
    // if (event.target.name === "photo") {
    //   setForm((f) => ({ ...f, photo: event.target.files[0] }));
    // }

    setForm((f) => ({ ...f, [event.target.name]: event.target.value }));
    setErrorMessage(null);
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (form.confirmPassword !== form.password) {
      setErrorMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await axios.post(
        "http://localhost:3001/auth/register",
        // "https://my-capstone-backend-02def2333679.herokuapp.com/auth/register",
        form
      );
      setErrorMessage("");
      setAppState((appState) => ({ ...appState, ...result.data }));
      localStorage.setItem("token", result.data.token);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        school: "",
        photo: null,
        // agreeToTerms: false,
      });
      navigate("/home");
    } catch (error) {
      if (error.code === "ERR_BAD_REQUEST") localStorage.removeItem("token");
      setErrorMessage(error.response.data.message);
      setAppState({
        user: null,
        token: null,
        courses: null,
        schedules: [],
        favorites: [],
        currScheduleId: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-indigo-50 flex w-full flex-col items-center justify-center">
      <div className="flex flex-row justify-center items-center h-full w-full lg:h-5/6 lg:w-5/6 rounded-lg drop-shadow-[0_0px_20px_rgba(0,0,0,0.25)]">
        <div className="hidden h-full rounded-l-lg w-7/12 bg-indigo-200 lg:flex items-center justify-center">
          <img src={regImg} className="h-2/3" />
        </div>
        <div className="flex h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white rounded-lg lg:rounded-l-none">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Link to="/">
              {/* Use Link to navigate to the home page */}
              <CalendarDaysIcon className="mx-auto h-10 w-auto text-indigo-600" />
              <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-indigo-600">
                Register!
              </h2>
            </Link>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-3 relative" onSubmit={handleOnSubmit}>
              <div className="split-inputs flex gap-2">
                <div className="input-field w-full">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium leading-6 text-gray-900">
                    First Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Jane"
                      value={form.firstName}
                      onChange={handleOnInputChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm: sm:leading-6 h-10"
                      required
                    />
                  </div>
                </div>
                <div className="input-field w-full">
                  <label
                    htmlFor="lastName"
                    className="block font-medium text-sm leading-6 text-gray-900">
                    Last Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={handleOnInputChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm: sm:leading-6 h-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="input-field">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="jane@doe.io"
                    value={form.email}
                    onChange={handleOnInputChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm: sm:leading-6 h-10"
                    required
                  />
                </div>
              </div>

              {/* New input field for school */}
              <div className="input-field">
                <label
                  htmlFor="school"
                  className="block text-sm font-medium leading-6 text-gray-900">
                  School
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="school"
                    placeholder="Enter your school"
                    value={form.school}
                    onChange={handleOnInputChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm: sm:leading-6 h-10"
                    required
                  />
                </div>
                {/* Add error handling for school if needed */}
              </div>

              <div className="input-field">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleOnInputChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm: sm:leading-6 h-10"
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium leading-6 text-gray-900">
                  Confirm Password
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleOnInputChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm: sm:leading-6 h-10"
                    required
                  />
                </div>
              </div>

              {errorMessage ? (
                <p className="absolute text-red-600 w-full -py-4">
                  {errorMessage}
                </p>
              ) : null}

              {/* New input field for photo */}
              {/* <div className="input-field">
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium leading-6 text-gray-900">
                  Photo
                </label>
                <div className="mt-2">
                  <label
                    htmlFor="photo"
                    className="cursor-pointer bg-indigo-600 rounded-md py-1.5 px-3  font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Choose file
                  </label>
                  <input
                    required
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    onChange={handleOnInputChange}
                    className="sr-only h-10"
                  />
                </div>
              </div> */}
              {/* Add error handling for photo if needed */}

              <div className="input-field">
                <button
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 mt-10 font-semibold leading-6 text-white  hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 h-10"
                  disabled={isLoading}
                  type="submit">
                  {isLoading ? "Loading..." : "Create Account"}
                </button>
              </div>
            </form>

            <p className="mt-10 text-center text-base text-gray-500">
              Already have an account?&nbsp;&nbsp;
              <Link
                to="/login"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
