import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";

import "../styles/login.css";

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await registerUser(name, email, password, role);

      alert("Account Created Successfully");

      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE */}

      <div className="login-left">
        <h1>DigiAttend</h1>

        <p>Create your account and start managing attendance smartly.</p>

        <div className="features">
          <div className="feature-card">Smart QR Attendance</div>

          <div className="feature-card">Real-time Tracking</div>

          <div className="feature-card">Secure Cloud Storage</div>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="login-right">
        <form className="login-form" onSubmit={handleRegister}>
          <h2>Create Account</h2>

          <p>Register to continue</p>

          {/* NAME */}

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* EMAIL */}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* ROLE */}

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>

            <option value="teacher">Teacher</option>

          </select>

          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* BUTTON */}

          <button type="submit">Create Account</button>

          {/* LOGIN LINK */}

          <div className="auth-switch">
            Already have an account?
            <Link to="/">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
