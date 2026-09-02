import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  MdPerson,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff
} from "react-icons/md";


function Register() {

  const navigate = useNavigate();


  // ==============================
  // STATES
  // ==============================

  const [name, setName] =
    useState("");

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
  // REGISTER
  // ==============================

  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");

    setLoading(true);


    try {

      const response =
        await fetch(
          "https://fashionmatch-backend.onrender.com/register",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                name,
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
          "Registration failed"
        );

      }


      // ==============================
      // SAVE JWT TOKEN
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


      <div className="auth-card">


        {/* HEADER */}

        <div className="auth-header">

          <div className="auth-logo">

            FM

          </div>


          <h1>
            Create your account
          </h1>


          <p>
            Join FashionMatch and discover
            your perfect style
          </p>

        </div>


        {/* ERROR */}

        {error && (

          <div className="auth-error">

            {error}

          </div>

        )}


        {/* FORM */}

       <form
  onSubmit={handleRegister}
  autoComplete="off"
>
  {/* NAME */}

  <div className="form-group">
    <label htmlFor="register-name">
      Full name
    </label>

    <div className="input-wrapper">

      <MdPerson className="input-icon" />

      <input
        id="register-name"
        name="register_full_name"
        type="text"
        autoComplete="off"
        placeholder="Enter your name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        required
      />

    </div>
  </div>


  {/* EMAIL */}

  <div className="form-group">
    <label htmlFor="register-email">
      Email address
    </label>

    <div className="input-wrapper">

      <MdEmail className="input-icon" />

      <input
        id="register-email"
        name="register_email"
        type="email"
        autoComplete="off"
        placeholder="you@example.com"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        required
      />

    </div>
  </div>


  {/* PASSWORD */}

  <div className="form-group">

    <label htmlFor="register-password">
      Password
    </label>

    <div className="input-wrapper">

      <MdLock className="input-icon" />

      <input
        id="register-password"
        name="register_password"
        type={
          showPassword
            ? "text"
            : "password"
        }
        autoComplete="new-password"
        placeholder="Create a password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        minLength="6"
        required
      />

      <button
        type="button"
        className="password-toggle"
        onClick={() =>
          setShowPassword(!showPassword)
        }
      >
        {showPassword
          ? <MdVisibilityOff />
          : <MdVisibility />
        }
      </button>

    </div>

  </div>


  <button
    type="submit"
    className="auth-submit"
    disabled={loading}
  >
    {loading
      ? "Creating account..."
      : "Create Account"
    }
  </button>

</form>


        {/* LOGIN LINK */}

        <div className="auth-switch">

          <span>
            Already have an account?
          </span>


          <Link to="/login">

            Sign in

          </Link>

        </div>


      </div>


      <p className="auth-footer">

        AI powered fashion recommendations

      </p>


    </div>

  );

}


export default Register;