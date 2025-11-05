import React from "react";

// Tiny pixel-art helper
export const PixelArt = ({ pixels, size = 16 }) => (
  <svg
    className="pixel-art"
    viewBox={`0 0 ${size} ${size}`}
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    {pixels.map(([x, y, color], i) => (
      <rect key={i} x={x} y={y} width="1" height="1" fill={color} />
    ))}
  </svg>
);

// Legacy SVG pixel data removed; all stages use CSS box-shadow animations now.

// (Dog stages now use animated CSS versions; pixel data no longer used)

// (Cat stages now use animated CSS versions; pixel data no longer used)

// (Lizard stages now use animated CSS versions; pixel data no longer used)

// Quick-and-cheerful color filters to approximate body color changes
const getDogColorFilter = (colorName) => {
  switch ((colorName || "brown").toLowerCase()) {
    case "yellow":
      return "hue-rotate(22deg) saturate(180%) brightness(110%)";
    case "green":
      return "hue-rotate(110deg) saturate(140%)";
    case "purple":
      return "hue-rotate(270deg) saturate(130%)";
    case "white":
      return "saturate(0%) brightness(175%)";
    case "orange":
      return "hue-rotate(10deg) saturate(170%)";
    case "brown":
    default:
      return "none";
  }
};

const AnimatedAdultDog = ({ color }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div
      className="pixelart-dog-adult"
      aria-label="Adult Dog"
      style={{ filter: getDogColorFilter(color) }}
    />
  </div>
);

const AnimatedTeenDog = ({ color }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div
      className="pixelart-dog-teen"
      aria-label="Teen Dog"
      style={{ filter: getDogColorFilter(color) }}
    />
  </div>
);

const AnimatedBabyDog = ({ color }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div
      className="pixelart-dog-baby"
      aria-label="Baby Dog"
      style={{ filter: getDogColorFilter(color) }}
    />
  </div>
);

export const PixelDog = ({ stage = 1, color = "brown" }) => (
  stage === 3
    ? <AnimatedAdultDog color={color} />
    : stage === 2
      ? <AnimatedTeenDog color={color} />
      : <AnimatedBabyDog color={color} />
);

const AnimatedAdultCat = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-to-css" aria-label="Adult Cat" />
  </div>
);

const AnimatedTeenCat = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-teen-cat" aria-label="Teen Cat" />
  </div>
);

const AnimatedBabyCat = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-baby-cat" aria-label="Baby Cat" />
  </div>
);

export const PixelCat = ({ stage = 1 }) => (
  stage === 3
    ? <AnimatedAdultCat />
    : stage === 2
      ? <AnimatedTeenCat />
      : <AnimatedBabyCat />
);

const AnimatedAdultLizard = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-lizard-adult" aria-label="Adult Lizard" />
  </div>
);

const AnimatedTeenLizard = () => (
  <div style={{ position: "relative", width: 85, height: 85 }}>
    <div className="pixelart-lizard-teen" aria-label="Teen Lizard" />
  </div>
);

const AnimatedBabyLizard = () => (
  <div style={{ position: "relative", width: 85, height: 85 }}>
    <div className="pixelart-lizard-baby" aria-label="Baby Lizard" />
  </div>
);

export const PixelLizard = ({ stage = 1 }) => (
  stage === 3
    ? <AnimatedAdultLizard />
    : stage === 2
      ? <AnimatedTeenLizard />
      : <AnimatedBabyLizard />
);

const AnimatedAdultBird = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bird-adult" aria-label="Adult Bird" />
  </div>
);

const AnimatedTeenBird = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bird-teen" aria-label="Teen Bird" />
  </div>
);

const AnimatedBabyBird = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bird-baby" aria-label="Baby Bird" />
  </div>
);

export const PixelBird = ({ stage = 1 }) => (
  stage === 3 ? <AnimatedAdultBird /> : stage === 2 ? <AnimatedTeenBird /> : <AnimatedBabyBird />
);

const AnimatedBabyBunny = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bunny-baby" aria-label="Baby Bunny" />
  </div>
);

const AnimatedTeenBunny = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bunny-teen" aria-label="Teen Bunny" />
  </div>
);

const AnimatedAdultBunny = () => (

  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bunny-adult" aria-label="Adult Bunny" />
  </div>
);

export const PixelBunny = ({ stage = 1 }) => (
  stage === 3 ? <AnimatedAdultBunny /> : stage === 2 ? <AnimatedTeenBunny /> : <AnimatedBabyBunny />
);

// Available pet species with their pixel art components
export const PET_SPECIES = [
  { value: "Dog", label: "Dog", Component: PixelDog },
  { value: "Cat", label: "Cat", Component: PixelCat },
  { value: "Bird", label: "Bird", Component: PixelBird },
  { value: "Bunny", label: "Bunny", Component: PixelBunny },
  { value: "Lizard", label: "Lizard", Component: PixelLizard },
];

// Get pixel art component for a species
export const getPetPixelArt = (species) => {
  const pet = PET_SPECIES.find((p) => p.value === species);
  return pet ? pet.Component : null;
};
