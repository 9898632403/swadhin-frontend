import React, { useState, useEffect } from "react";
import { X, Package, Truck, CheckCircle, Clock } from "react-feather";
import "../styles/TrackOrderModal.css";

const statusSteps = [
  { 
    key: "Pending", 
    label: "Pending", 
    icon: <Clock />,
    animation: "clock-spin"
  },
  { 
    key: "Packed", 
    label: "Packed", 
    icon: <Package />,
    animation: "box-open" 
  },
  { 
    key: "Out for Delivery", 
    label: "On the Way", 
    icon: <Truck />,
    animation: "truck-move" 
  },
  { 
    key: "Delivered", 
    label: "Delivered", 
    icon: <CheckCircle />,
    animation: "delivery-man" 
  },
];

const TrackOrderModal = ({ status, onClose, statusUpdatedAt }) => {
  const [activeIndex, setActiveIndex] = useState(getStepIndex(status));
  const [playingAnimation, setPlayingAnimation] = useState(null);

  function getStepIndex(status) {
    return statusSteps.findIndex((s) => s.key === status);
  }

  const handleIconClick = (index, animationType) => {
    if (index <= activeIndex) {
      setPlayingAnimation(animationType);
      setTimeout(() => setPlayingAnimation(null), 3000);
    }
  };

  return (
    <div className="trackOverlay">
      <div className="trackModal">
        <button className="closeBtn" onClick={onClose}>
          <X size={20} />
          <span className="closeTooltip">Close</span>
        </button>
        
        <div className="header">
          <h2>Order Journey</h2>
          <div className="progressPulse"></div>
        </div>
        
        <div className="stepContainer">
          {statusSteps.map((step, index) => (
            <div
              key={step.key}
              className={`step ${index <= activeIndex ? "active" : ""}`}
            >
              <div 
                className="iconWrapper"
                onClick={() => handleIconClick(index, step.animation)}
              >
                <div className={`icon ${playingAnimation === step.animation ? 'animate' : ''}`}>
                  {step.icon}
                </div>
                <div className={`animation-effect ${step.animation} ${playingAnimation === step.animation ? 'play' : ''}`}></div>
              </div>
              <span className="label">{step.label}</span>
              {index < statusSteps.length - 1 && (
                <div className="line">
                  <div className="lineProgress"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {statusUpdatedAt && (
          <p className="updatedTime">
            <span className="timeIcon">🕒</span>
            Last updated: {new Date(statusUpdatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default TrackOrderModal;