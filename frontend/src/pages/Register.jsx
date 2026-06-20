import { useState } from "react"
import axios from "axios"
import "../assets/CSS/auth.css"
import coverImage from "../assets/images/cover_page.png"
import { Link } from "react-router-dom";
const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")

  const register = async () => {
    await axios.post("http://localhost:5000/register", { name, email, password, role })
    alert("Registered successfully")
    window.location = "/"
  }

  return (
    <div
      className="auth-container"
      style={{ backgroundImage: `url(${coverImage})` }}
    >
      <div className="auth-overlay" />

      <div className="auth-center">
        <div className="auth-card">

          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div>
              <div className="auth-brand-name">SSMS</div>
              <div className="auth-brand-sub">Smart Student Management System</div>
            </div>
          </div>

          <h2 className="auth-card-title">Create account</h2>
          <p className="auth-card-sub">Fill in your details to get started</p>

          <label className="auth-label">Full name</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Your full name"
            onChange={(e) => setName(e.target.value)}
          />

          <label className="auth-label">Email address</label>
          <input
            className="auth-input"
            type="email"
            placeholder="you@institution.edu"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="auth-label">Role</label>
          <select
            className="auth-input auth-select"
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          <button className="auth-button" onClick={register}>
            Create account
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-label">or</span>
            <span className="auth-divider-line" />
          </div>

          <p className="auth-footer-text">
  Already have an account?
  <Link className="auth-link" to="/login">
    Login here
  </Link>
</p>

        </div>
      </div>
    </div>
  )
}

export default Register