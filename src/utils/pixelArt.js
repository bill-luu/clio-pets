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
      return "hue-rotate(30deg) saturate(230%) brightness(145%) contrast(105%)";
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

// Similar color filters for birds (default visual target is yellow)
const getBirdColorFilter = (colorName) => {
  switch ((colorName || "yellow").toLowerCase()) {
    case "yellow":
      return "none";
    case "green":
      return "hue-rotate(60deg) saturate(165%) brightness(105%)";
    case "purple":
      return "hue-rotate(230deg) saturate(180%) brightness(70%)";
    case "white":
      return "saturate(0%) brightness(175%)";
    case "orange":
      return "hue-rotate(300deg) saturate(400%)";
    case "brown":
      return "hue-rotate(300deg) saturate(90%) brightness(40%)"
    default:
      return "none";
  }
};

// Color filters for bunnies (base sprite is pink)
const getBunnyColorFilter = (colorName) => {
  switch ((colorName || "pink").toLowerCase()) {
    case "pink":
      return "none";
    case "yellow":
      return "hue-rotate(60deg) saturate(330%)";
    case "green":
      return "hue-rotate(140deg) saturate(250%) brightness(115%) contrast(105%);"
    case "purple":
      return "hue-rotate(260deg) saturate(140%)";
    case "white":
      return "saturate(0%) brightness(175%)";
    case "orange":
      return "hue-rotate(30deg) saturate(500%)";
    case "blue":
      return "hue-rotate(220deg) saturate(330%)";
    case "brown":
      return "hue-rotate(320deg) saturate(80%) brightness(60%)";
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
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-lizard-teen" aria-label="Teen Lizard" />
  </div>
);

const AnimatedBabyLizard = () => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
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

const AnimatedAdultBird = ({ color }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bird-adult" aria-label="Adult Bird" style={{ filter: getBirdColorFilter(color) }} />
  </div>
);

const AnimatedTeenBird = ({ color }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bird-teen" aria-label="Teen Bird" style={{ filter: getBirdColorFilter(color) }} />
  </div>
);

const AnimatedBabyBird = ({ color }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bird-baby" aria-label="Baby Bird" style={{ filter: getBirdColorFilter(color) }} />
  </div>
);

export const PixelBird = ({ stage = 1, color = "yellow" }) => (
  stage === 3 ? <AnimatedAdultBird color={color} /> : stage === 2 ? <AnimatedTeenBird color={color} /> : <AnimatedBabyBird color={color} />
);

const AnimatedBabyBunny = ({ color }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bunny-baby" aria-label="Baby Bunny" style={{ filter: getBunnyColorFilter(color) }} />
  </div>
);

const AnimatedTeenBunny = ({ color }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bunny-teen" aria-label="Teen Bunny" style={{ filter: getBunnyColorFilter(color) }} />
  </div>
);

const AnimatedAdultBunny = ({ color }) => (

  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bunny-adult" aria-label="Adult Bunny" style={{ filter: getBunnyColorFilter(color) }} />
  </div>
);

export const PixelBunny = ({ stage = 1, color = "pink" }) => (
  stage === 3 ? <AnimatedAdultBunny color={color} /> : stage === 2 ? <AnimatedTeenBunny color={color} /> : <AnimatedBabyBunny color={color} />
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
