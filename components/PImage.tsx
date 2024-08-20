import React from "react";

const PImage = ({ imageUrl, text, radius, fontSize, type }: any) => {
  return (
    <div className={`p-image ${type}`}>
      <img src={imageUrl} alt={text} style={{ borderRadius: `${radius}px` }} />
      <div className="image-text" style={{ fontSize: `${fontSize}px` }}>
        {text}
      </div>
    </div>
  );
};

export default PImage;
