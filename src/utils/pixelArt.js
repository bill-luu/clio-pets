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

const AnimatedAdultDog = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-dog-adult" aria-label="Adult Dog" />
  </div>
);

const AnimatedTeenDog = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-dog-teen" aria-label="Teen Dog" />
  </div>
);

const AnimatedBabyDog = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-dog-baby" aria-label="Baby Dog" />
  </div>
);

export const PixelDog = ({ stage = 1 }) => (
  stage === 3
    ? <AnimatedAdultDog />
    : stage === 2
      ? <AnimatedTeenDog />
      : <AnimatedBabyDog />
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

// Available pet species with their pixel art components
export const PET_SPECIES = [
  { value: "Dog", label: "Dog", Component: PixelDog },
  { value: "Cat", label: "Cat", Component: PixelCat },
  { value: "Lizard", label: "Lizard", Component: PixelLizard },
];

// Get pixel art component for a species
export const getPetPixelArt = (species) => {
  const pet = PET_SPECIES.find((p) => p.value === species);
  return pet ? pet.Component : null;
};
