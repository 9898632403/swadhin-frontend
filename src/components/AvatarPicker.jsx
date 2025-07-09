import React, { useState } from 'react';
import { AvatarCreator } from '@readyplayerme/react-avatar-creator';
import { Avatar as LoadedAvatar } from '@readyplayerme/visage';
import "../styles/AvatarPicker.css";

const AvatarPicker = () => {
  const [avatarUrl, setAvatarUrl] = useState("");

  return (
    <div className="avatar-picker">
      <h2>🧍‍♀️ Create Your Avatar</h2>
      <AvatarCreator
        subdomain="demo"
        config={{ bodyType: 'fullbody', quickStart: true }}
        onAvatarExported={(e) => setAvatarUrl(e.data.url)}
      />
      {avatarUrl && (
        <div className="avatar-preview">
          <LoadedAvatar style={{ width: 300, height: 350 }} src={avatarUrl} />
        </div>
      )}
    </div>
  );
};

export default AvatarPicker;