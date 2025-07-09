// src/components/NotificationPopup.jsx
import React, { useEffect, useRef } from 'react';
import '../styles/notificationPopup.css';
import popSound from '../assets/pop.mp3';

const NotificationPopup = ({ message, onClose }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    const playSound = () => {
      if (audioRef.current) {
        console.log('🔊 Attempting to play sound...');
        audioRef.current.play()
          .then(() => {
            console.log('✅ Sound played successfully');
          })
          .catch((err) => {
            console.error('❌ Sound play error:', err.name, err.message, err);
          });
      } else {
        console.warn('⚠️ audioRef is null');
      }
    };

    // Check file loaded
    if (audioRef.current) {
      audioRef.current.oncanplaythrough = () => {
        console.log('📦 Audio file loaded and ready');
      };
      audioRef.current.onerror = () => {
        console.error('❌ Failed to load audio file');
      };
    }

    document.body.addEventListener('click', playSound, { once: true });

    const timer = setTimeout(onClose, 10000);
    return () => {
      clearTimeout(timer);
      document.body.removeEventListener('click', playSound);
    };
  }, [onClose]);

  return (
    <div className="notification-popup">
      <audio ref={audioRef} src={popSound} preload="auto" />
      <div className="fireworks"></div>
      <div className="popup-content">
        <span>{message}</span>
        <button onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default NotificationPopup;
