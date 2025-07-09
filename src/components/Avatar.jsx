import React from "react";


const Avatar = ({ gender, shape, pose, topColor, bottomColor }) => {
  const getImage = () =>
    `/avatars/${gender.toLowerCase()}-${shape.toLowerCase()}-${pose.toLowerCase()}.png`;

  const getMask = (part) =>
    `/avatars/${gender.toLowerCase()}-${shape.toLowerCase()}-${pose.toLowerCase()}-mask-${part}.png`;

  return (
    <div className="avatar-container">
      <img src={getImage()} alt="Avatar" className="avatar-base" />
      <div
        className="color-fill-dynamic top"
        style={{
          backgroundColor: topColor,
          maskImage: `url(${getMask("top")})`,
          WebkitMaskImage: `url(${getMask("top")})`,
        }}
      />
      <div
        className="color-fill-dynamic bottom"
        style={{
          backgroundColor: bottomColor,
          maskImage: `url(${getMask("bottom")})`,
          WebkitMaskImage: `url(${getMask("bottom")})`,
        }}
      />
    </div>
  );
};

export default Avatar;
