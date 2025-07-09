import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Html } from "@react-three/drei";
import "../styles/TrendToolkit.css";

// Constants for maintainability
const MODEL_PATHS = {
  male: "/models/male.glb",
  female: "/models/female.glb",
};

const UPPER_BODY_PARTS = ["shirt", "hoodie", "top", "jacket"];
const LOWER_BODY_PARTS = ["pants", "jeans", "shorts", "skirt"];

const Avatar = React.memo(({ gender, upperColor, lowerColor }) => {
  const { scene } = useGLTF(MODEL_PATHS[gender]);

  React.useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        child.material = child.material.clone();

        if (UPPER_BODY_PARTS.some(part => name.includes(part))) {
          child.material.color.set(upperColor);
        } else if (LOWER_BODY_PARTS.some(part => name.includes(part))) {
          child.material.color.set(lowerColor);
        }

        child.material.needsUpdate = true;
      }
    });
  }, [scene, upperColor, lowerColor]);

  return <primitive object={scene} scale={1.3} position={[0, -1.4, 0]} />;
});

const Loader = () => (
  <Html center>
    <div className="loading-spinner">Loading model...</div>
  </Html>
);

const ColorPicker = ({ 
  color, 
  onChange, 
  isOpen, 
  onToggle, 
  icon, 
  label,
  buttonStyle 
}) => (
  <div className="color-picker-container">
    <button
      className="color-picker-button"
      onClick={onToggle}
      style={{ backgroundColor: color, ...buttonStyle }}
      aria-label={`Change ${label} color`}
      aria-expanded={isOpen}
    >
      <span role="img" aria-hidden="true">{icon}</span>
    </button>
    {isOpen && (
      <div className="color-picker-input-container">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Select ${label} color`}
        />
        <span className="color-hex-value">{color.toUpperCase()}</span>
      </div>
    )}
  </div>
);

const GenderToggle = ({ gender, onChange }) => (
  <div className="gender-toggle">
    <button
      className={`gender-button ${gender === "female" ? "active" : ""}`}
      onClick={() => onChange("female")}
      aria-pressed={gender === "female"}
    >
      <span role="img" aria-label="Female">👩</span> Female
    </button>
    <button
      className={`gender-button ${gender === "male" ? "active" : ""}`}
      onClick={() => onChange("male")}
      aria-pressed={gender === "male"}
    >
      <span role="img" aria-label="Male">👨</span> Male
    </button>
  </div>
);

const TrendToolkit = () => {
  const [gender, setGender] = useState("female");
  const [upperColor, setUpperColor] = useState("#87CEEB");
  const [lowerColor, setLowerColor] = useState("#556B2F");
  const [showUpperPicker, setShowUpperPicker] = useState(false);
  const [showLowerPicker, setShowLowerPicker] = useState(false);

  const handleColorToggle = (pickerType) => {
    if (pickerType === "upper") {
      setShowUpperPicker(!showUpperPicker);
      setShowLowerPicker(false);
    } else {
      setShowLowerPicker(!showLowerPicker);
      setShowUpperPicker(false);
    }
  };

  return (
    <div className="trend-toolkit-container">
      <header className="toolkit-header">
        <h1>3D Fashion Customizer</h1>
        <p>Design and visualize your custom outfits in real-time</p>
      </header>

      <div className="controls-panel">
        <GenderToggle gender={gender} onChange={setGender} />

        <div className="color-controls">
          <ColorPicker
            color={upperColor}
            onChange={setUpperColor}
            isOpen={showUpperPicker}
            onToggle={() => handleColorToggle("upper")}
            icon="👕"
            label="upper body"
            buttonStyle={{ marginRight: "1rem" }}
          />

          <ColorPicker
            color={lowerColor}
            onChange={setLowerColor}
            isOpen={showLowerPicker}
            onToggle={() => handleColorToggle("lower")}
            icon="👖"
            label="lower body"
          />
        </div>
      </div>

      <div className="canvas-container">
        <Canvas 
          camera={{ position: [0, 1.5, 3], fov: 50 }}
          shadows
        >
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[0, 5, 5]} 
            intensity={1} 
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <Suspense fallback={<Loader />}>
            <Environment preset="studio" />
            <OrbitControls 
              enableZoom={true} 
              enablePan={true}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 1.8}
            />
            <Avatar gender={gender} upperColor={upperColor} lowerColor={lowerColor} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default TrendToolkit;