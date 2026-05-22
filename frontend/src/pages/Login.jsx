import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";

import { loginUser } from "../services/authService";

import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  // const [role, setRole] = useState("student");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Login + fetch role

      const userData = await loginUser(email, password);

      // Role based redirect

      if (userData.role === "student") {
        navigate("/student");
      } else if (userData.role === "teacher") {
        navigate("/teacher");
      } else if (userData.role === "admin") {
        navigate("/admin");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE */}

      <div className="login-left">
        <img src="/logo.png" alt="DigiAttend Logo" className="login-logo" />
        <h1>DigiAttend</h1>
        <p>Smart QR Based Attendance Management System</p>
      </div>

      {/* RIGHT SIDE */}

      <div className="login-right">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>

          <p>Login to continue</p>

          {/* ROLE SELECTOR */}

          {/* <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>

            <option value="teacher">Teacher</option>

            <option value="admin">Admin</option>
          </select> */}

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* LOGIN BUTTON */}

          <button type="submit">Login</button>

          {/* CREATE ACCOUNT */}

          <div className="auth-switch">
            Don&apos;t have an account?
            <Link to="/register">Create Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
