import { useState, useRef } from "react"
import axios from "axios"
import "../assets/CSS/auth.css"
import coverImage from "../assets/images/cover_page.png"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const validity = useRef(null)

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", { email, password })

      if (res.data.role === "student") {
        localStorage.setItem("studentEmail", email)
        localStorage.setItem("studentId", res.data.id)
        window.location = "/student"
      } else if (res.data.role === "teacher") {
        localStorage.setItem("teacherEmail", email)
        localStorage.setItem("teacherId", res.data.id)
        window.location = "/teacher"
      } else if (res.data.role === "admin") {
        window.location = "/admin"
      } else {
        validity.current.innerText = res.data.message
        validity.current.style.color = "#f87171"
      }
    } catch (err) {
      validity.current.innerText = "Login failed. Please check your credentials."
      validity.current.style.color = "#f87171"
      console.error(err)
    }
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

          <h2 className="auth-card-title">Welcome back</h2>
          <p className="auth-card-sub">Sign in to continue to your dashboard</p>

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

          <button className="auth-button" onClick={login}>
            Sign in
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>

          <p className="auth-error" ref={validity} />

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-label">or</span>
            <span className="auth-divider-line" />
          </div>

          <p className="auth-footer-text">
            Don't have an account?{" "}
            <a className="auth-link" href="/register">Register here</a>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login