"use client";

import { useEffect, useState } from 'react';
import './SimpleCard.css';

export default function SimpleCard() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after component mounts
        setTimeout(() => setIsVisible(true), 300);
    }, []);

    return (
        <div className={`card-container ${isVisible ? 'visible' : ''}`}>
            <div className="id-card">
                {/* Card Front */}
                <div className="card-face card-front">
                    <div className="card-header">
                        <div className="logo-circle">V</div>
                        <div className="card-stripe"></div>
                    </div>

                    <div className="card-content">
                        <h1 className="company-name">VAJRA</h1>
                        <p className="role-title">YOUR INFAMOUS CISO</p>
                    </div>

                    <div className="card-footer">
                        <div className="chip"></div>
                        <div className="security-text">SECURITY CLEARANCE: MAXIMUM</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
