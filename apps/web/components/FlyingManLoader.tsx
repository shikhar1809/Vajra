'use client'

import React from 'react';

const FlyingManLoader = () => {
  return (
    <div className="loader-container">
      <style dangerouslySetInnerHTML={{
        __html: `
        .loader-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #020617; /* Slate 950 */
          overflow: hidden;
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* --- CLOUDS --- */
        .clouds {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
          transform: translateY(-50%);
        }

        .cloud {
            position: absolute;
            width: 100px;
            height: 40px;
            background: #1e293b; /* Slate 800 */
            border-radius: 40px;
            opacity: 0.4;
            animation: moveClouds 2s linear infinite;
        }

        .cloud1 { top: 20%; left: 100%; width: 120px; animation-duration: 3s; opacity: 0.3; }
        .cloud2 { top: 40%; left: 100%; width: 80px; animation-duration: 2s; opacity: 0.2; }
        .cloud3 { top: 60%; left: 100%; width: 140px; animation-duration: 3.5s; opacity: 0.3; }
        .cloud4 { top: 80%; left: 100%; width: 100px; animation-duration: 2.5s; opacity: 0.2; }
        .cloud5 { top: 10%; left: 100%; width: 90px; animation-duration: 4s; opacity: 0.3; }

        @keyframes moveClouds {
            from { transform: translateX(0); }
            to { transform: translateX(-120vw); }
        }

        /* --- THE SHIELD Container --- */
        .loader {
          position: relative;
          width: 150px;
          height: 100px; 
          z-index: 10;
          animation: speeder 0.4s linear infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Speed Streak (White trail) */
        .loader > span {
          height: 2px;
          width: 35px;
          background: rgba(255, 255, 255, 0.4);
          position: absolute;
          top: 20px;
          left: -40px; /* Behind shield */
          border-radius: 2px 10px 1px 0;
          z-index: 1;
        }

        /* THE SHIELD */
        .base {
          position: absolute;
          width: 70px;
          height: 90px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); /* Slate gradient */
          border: 3px solid #ef4444; /* Red Border */
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2);
          z-index: 10;
          /* Shield Shape */
          clip-path: path("M35 0 C35 0 70 0 70 20 V 45 C70 70 35 90 35 90 C35 90 0 70 0 45 V 20 C0 0 35 0 35 0 Z");
          
          /* Rotating & Flashing Animation */
          animation: shield-spin 0.6s linear infinite, shield-flash 0.2s ease-in-out infinite alternate;
          
          transform-origin: center center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @keyframes shield-spin {
            0% { transform: rotate(0deg) scale(1.3); }
            100% { transform: rotate(360deg) scale(1.3); }
        }
        
        @keyframes shield-flash {
            0% { filter: brightness(1); border-color: #ef4444; }
            100% { filter: brightness(1.5); border-color: #fca5a5; box-shadow: 0 0 30px #ef4444; }
        }

        /* LOGO IMAGE */
        .logo-img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          animation: pulse 1s ease-in-out infinite alternate;
          /* Rotate counter to spin to keep logo upright? No, let it spin with shield */
        }

        @keyframes pulse {
            0% { transform: scale(0.8); opacity: 0.9; }
            100% { transform: scale(1); opacity: 1; }
        }

        /* Stream/Speed lines */
        .loader > span > span {
          width: 30px;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
          position: absolute;
          animation: fazer1 0.2s linear infinite;
        }

        .loader > span > span:nth-child(2) {
          top: 3px;
          animation: fazer2 0.4s linear infinite;
        }

        .loader > span > span:nth-child(3) {
          top: 1px;
          animation: fazer3 0.4s linear infinite;
          animation-delay: -1s;
        }

        .loader > span > span:nth-child(4) {
          top: 4px;
          animation: fazer4 1s linear infinite;
          animation-delay: -1s;
        }

        @keyframes fazer1 {
          0% { left: 0; }
          100% { left: -80px; opacity: 0; }
        }

        @keyframes fazer2 {
          0% { left: 0; }
          100% { left: -100px; opacity: 0; }
        }

        @keyframes fazer3 {
          0% { left: 0; }
          100% { left: -50px; opacity: 0; }
        }

        @keyframes fazer4 {
          0% { left: 0; }
          100% { left: -150px; opacity: 0; }
        }

        @keyframes speeder {
          0% { transform: translate(2px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -3px) rotate(-1deg); }
          20% { transform: translate(-2px, 0px) rotate(1deg); }
          30% { transform: translate(1px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 3px) rotate(-1deg); }
          60% { transform: translate(-1px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-2px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 1px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }

        /* --- LONG FAZERS (Speed Lines) --- */
        .longfazers {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 5;
        }

        .longfazers span {
          position: absolute;
          height: 2px;
          width: 20%;
          background: #ef4444; /* Red speed lines */
          opacity: 0;
        }

        .longfazers span:nth-child(1) {
          top: 20%;
          animation: lf 0.6s linear infinite;
          animation-delay: -5s;
        }

        .longfazers span:nth-child(2) {
          top: 40%;
          animation: lf 0.8s linear infinite;
          animation-delay: -1s;
        }

        .longfazers span:nth-child(3) {
          top: 60%;
          animation: lf 0.6s linear infinite;
          animation-delay: -1s;
        }

        .longfazers span:nth-child(4) {
          top: 80%;
          animation: lf 0.5s linear infinite;
          animation-delay: -3s;
        }

        @keyframes lf {
          0% { left: 200%; opacity: 0; }
          5% { opacity: 0.8; }
          100% { left: -200%; opacity: 0; }
        }
        `}} />

      {/* Background Clouds */}
      <div className="clouds">
        <div className="cloud cloud1" />
        <div className="cloud cloud2" />
        <div className="cloud cloud3" />
        <div className="cloud cloud4" />
        <div className="cloud cloud5" />
      </div>

      {/* The Flying Shield */}
      <div className="loader">
        <span>
          <span /><span /><span /><span />
        </span>
        <div className="base"> {/* Shield Container */}
          <img src="/vajra-shield-logo.png" className="logo-img" alt="Vajra Logo" />
        </div>
      </div>

      {/* Long Speed Lines */}
      <div className="longfazers">
        <span /><span /><span /><span />
      </div>

    </div>
  );
};

export default FlyingManLoader;
