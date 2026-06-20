import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/CSS/coverpage.css";
import coverImage from "../assets/images/cover_page.png";

import {
  FaBrain,
  FaTrafficLight,
  FaMicrophoneAlt,
  FaChartLine,
} from "react-icons/fa";

const CoverPage = () => {
  const navigate = useNavigate();

  return (
    <div className="cover-page-wrapper">
      <div className="cover-container">
        <div
          className="cover-bg"
          style={{ backgroundImage: `url(${coverImage})` }}
        />

        <div className="cover-overlay" />

        <div className="cover-content">
          <div className="cover-logo">
  🎓
</div>
          <h1 className="cover-title">
            Smart Student Management System
          </h1>

          <p className="cover-subtitle">
            NLP-Based Assignment Evaluation & Voice/Text Academic Assistant
          </p>

          <div className="cover-divider"></div>

          <p className="cover-desc">
            A web-based academic platform that automates attendance monitoring,
            evaluates assignments using Natural Language Processing, tracks
            student performance through analytics, and provides intelligent
            academic support through a voice/text virtual assistant.
          </p>

          {/* Feature Cards */}
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon purple">
                <FaBrain />
              </div>
              <h4>NLP Evaluation</h4>
             
            </div>

            <div className="feature-card">
              <div className="feature-icon green">
                <FaTrafficLight />
              </div>
              <h4>Traffic-Light Attendance</h4>
              
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <FaMicrophoneAlt />
              </div>
              <h4>Voice Assistant</h4>
              
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">
                <FaChartLine />
              </div>
              <h4>Performance Reports</h4>
             
            </div>
          </div>

          <button
            className="cover-btn"
            onClick={() => navigate("/login")}
          >
            Enter System

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;