import React from "react";

// Tiny pixel-art helper
export const PixelArt = ({ pixels, size = 16, scale = 1 }) => (
  <svg
    className="pixel-art"
    viewBox={`0 0 ${size} ${size}`}
    shapeRendering="crispEdges"
    aria-hidden="true"
    style={{ 
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      transition: 'transform 0.3s ease'
    }}
  >
    {pixels.map(([x, y, color], i) => (
      <rect key={i} x={x} y={y} width="1" height="1" fill={color} />
    ))}
  </svg>
);

const buildPixels = () => {
  const rect = (arr, x1, y1, x2, y2, color) => {
    for (let y = y1; y < y2; y += 1) {
      for (let x = x1; x < x2; x += 1) {
        arr.push([x, y, color]);
      }
    }
  };

  // Dog (brown)
  const dog = []; // base body
  rect(dog, 3, 8, 12, 13, "#b9783c"); // body
  rect(dog, 2, 5, 7, 9, "#b9783c"); // head
  rect(dog, 1, 4, 2, 6, "#8a5a2b"); // ear L
  rect(dog, 6, 4, 7, 6, "#8a5a2b"); // ear R
  rect(dog, 3, 6, 4, 7, "#000000"); // eye L
  rect(dog, 5, 6, 6, 7, "#000000"); // eye R
  rect(dog, 4, 7, 5, 8, "#000000"); // nose
  rect(dog, 12, 9, 14, 10, "#b9783c"); // tail
  rect(dog, 4, 13, 5, 15, "#8a5a2b"); // leg L
  rect(dog, 9, 13, 10, 15, "#8a5a2b"); // leg R
  // collar and tag
  rect(dog, 2, 8, 7, 9, "#c0392b"); // red collar under head
  rect(dog, 4, 9, 5, 10, "#f1c40f"); // gold tag

  // Cat (orange)
  const cat = [];
  rect(cat, 3, 8, 12, 13, "#f39c12"); // body
  rect(cat, 2, 5, 7, 9, "#f39c12"); // head
  rect(cat, 1, 4, 2, 5, "#d35400"); // ear L
  rect(cat, 6, 4, 7, 5, "#d35400"); // ear R
  rect(cat, 3, 6, 4, 7, "#000000"); // eye L
  rect(cat, 5, 6, 6, 7, "#000000"); // eye R
  rect(cat, 4, 7, 5, 8, "#ff7aa2"); // nose
  // defined whiskers (three lines per side)
  rect(cat, 0, 6, 2, 7, "#ffffff"); // whisker L top
  rect(cat, 0, 7, 2, 8, "#ffffff"); // whisker L mid
  rect(cat, 0, 8, 2, 9, "#ffffff"); // whisker L bottom
  rect(cat, 6, 6, 8, 7, "#ffffff"); // whisker R top
  rect(cat, 6, 7, 8, 8, "#ffffff"); // whisker R mid
  rect(cat, 6, 8, 8, 9, "#ffffff"); // whisker R bottom
  rect(cat, 12, 9, 14, 10, "#f39c12"); // tail
  rect(cat, 4, 13, 5, 15, "#d35400"); // leg L
  rect(cat, 9, 13, 10, 15, "#d35400"); // leg R

  // Lizard (green)
  const lizard = [];
  rect(lizard, 3, 8, 13, 12, "#27ae60"); // long body
  rect(lizard, 2, 7, 5, 10, "#27ae60"); // head
  rect(lizard, 3, 8, 4, 9, "#000000"); // eye
  rect(lizard, 13, 9, 15, 10, "#2ecc71"); // tail 1
  rect(lizard, 15, 10, 16, 11, "#2ecc71"); // tail 2
  rect(lizard, 5, 12, 6, 13, "#1e8f4f"); // leg 1
  rect(lizard, 7, 12, 8, 13, "#1e8f4f"); // leg 2
  rect(lizard, 9, 12, 10, 13, "#1e8f4f"); // leg 3
  rect(lizard, 11, 12, 12, 13, "#1e8f4f"); // leg 4
  // sombrero (tan brim + crown) above head
  rect(lizard, 1, 6, 7, 7, "#caa472"); // brim
  rect(lizard, 3, 4, 5, 6, "#caa472"); // crown body
  rect(lizard, 3, 6, 5, 7, "#8d6e4f"); // hat band

  return { dog, cat, lizard };
};

const {
  dog: DOG_PIXELS,
  cat: CAT_PIXELS,
  lizard: LIZARD_PIXELS,
} = buildPixels();

/**
 * Get scale factor based on pet stage
 * Baby: 0.7x, Teen: 0.85x, Adult: 1.0x
 */
const getScaleForStage = (stage) => {
  switch (stage) {
    case 1: // Baby
      return 0.7;
    case 2: // Teen
      return 0.85;
    case 3: // Adult
    default:
      return 1.0;
  }
};

export const PixelDog = ({ stage = 1 }) => (
  <PixelArt pixels={DOG_PIXELS} scale={getScaleForStage(stage)} />
);

export const PixelCat = ({ stage = 1 }) => (
  <PixelArt pixels={CAT_PIXELS} scale={getScaleForStage(stage)} />
);

export const PixelLizard = ({ stage = 1 }) => (
  <PixelArt pixels={LIZARD_PIXELS} scale={getScaleForStage(stage)} />
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
