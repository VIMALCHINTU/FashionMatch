import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowBack
} from "react-icons/md";


function Login() {

  const navigate = useNavigate();


  // ==============================
  // STATES
  // ==============================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==============================
  // LOGIN
  // ==============================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    setLoading(true);


    try {

      const response =
        await fetch(
          "https://fashionmatch-backend.onrender.com/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                email,
                password
              })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to login"
        );

      }


      // ==============================
      // SAVE TOKEN
      // ==============================

      localStorage.setItem(
        "token",
        data.token
      );


      // ==============================
      // SAVE USER
      // ==============================

      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user
        )
      );


      // ==============================
      // REDIRECT
      // ==============================

      navigate("/");


    } catch (error) {

      setError(
        error.message ||
        "Something went wrong"
      );


    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-page">


      {/* BACK BUTTON */}

      <Link
        to="/"
        className="auth-back"
      >

        <MdArrowBack />

        Back

      </Link>


      {/* LOGIN CARD */}

      <div className="auth-card">


        {/* HEADER */}

        <div className="auth-header">

          <div className="auth-logo">

            FM

          </div>


          <h1>
            Welcome back
          </h1>


          <p>
            Sign in to continue
            your FashionMatch journey
          </p>

        </div>


        {/* ERROR */}

        {error && (

          <div
            className="auth-error"
          >

            {error}

          </div>

        )}


        {/* FORM */}

        <form
          onSubmit={
            handleLogin
          }
        >


          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email address
            </label>


            <div className="input-wrapper">

              <MdEmail
                className="input-icon"
              />


              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <label>
              Password
            </label>


            <div className="input-wrapper">

              <MdLock
                className="input-icon"
              />


              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >

                {showPassword
                  ? <MdVisibilityOff />
                  : <MdVisibility />
                }

              </button>

            </div>

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >

            {loading
              ? (
                <>
                  <span className="auth-spinner" />

                  Logging in...

                </>
              )
              : (
                "Sign in"
              )
            }

          </button>


        </form>


        {/* REGISTER */}

        <div
          className="auth-switch"
        >

          <span>
            Don't have an account?
          </span>


          <Link
            to="/register"
          >

            Create account

          </Link>

        </div>


      </div>


      {/* FOOTER */}

      <p
        className="auth-footer"
      >

        AI powered fashion recommendations

      </p>


    </div>

  );

}


export default Login;