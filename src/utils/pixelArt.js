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

const buildPixels = () => {
  const rect = (arr, x1, y1, x2, y2, color) => {
    for (let y = y1; y < y2; y += 1) {
      for (let x = x1; x < x2; x += 1) {
        arr.push([x, y, color]);
      }
    }
  };

  // ===== BABY DOG - Simple, round, smooth =====
  const babyDog = [];
  rect(babyDog, 4, 9, 11, 13, "#b9783c"); // small body
  rect(babyDog, 4, 6, 9, 9, "#b9783c"); // round head
  rect(babyDog, 3, 5, 4, 7, "#8a5a2b"); // ear L
  rect(babyDog, 9, 5, 10, 7, "#8a5a2b"); // ear R
  rect(babyDog, 5, 7, 6, 8, "#000000"); // eye L (bigger cute eyes)
  rect(babyDog, 7, 7, 8, 8, "#000000"); // eye R
  rect(babyDog, 6, 8, 7, 9, "#000000"); // small nose
  rect(babyDog, 11, 10, 12, 11, "#b9783c"); // tiny tail
  rect(babyDog, 5, 13, 6, 14, "#8a5a2b"); // tiny leg L
  rect(babyDog, 8, 13, 9, 14, "#8a5a2b"); // tiny leg R

  // ===== TEEN DOG - More defined, longer =====
  const teenDog = [];
  rect(teenDog, 3, 8, 12, 13, "#b9783c"); // body
  rect(teenDog, 2, 5, 7, 9, "#b9783c"); // head
  rect(teenDog, 1, 4, 2, 6, "#8a5a2b"); // ear L
  rect(teenDog, 6, 4, 7, 6, "#8a5a2b"); // ear R
  rect(teenDog, 3, 6, 4, 7, "#000000"); // eye L
  rect(teenDog, 5, 6, 6, 7, "#000000"); // eye R
  rect(teenDog, 4, 7, 5, 8, "#000000"); // nose
  rect(teenDog, 12, 9, 14, 10, "#b9783c"); // tail
  rect(teenDog, 4, 13, 5, 15, "#8a5a2b"); // leg L
  rect(teenDog, 9, 13, 10, 15, "#8a5a2b"); // leg R
  rect(teenDog, 2, 8, 7, 9, "#c0392b"); // collar
  rect(teenDog, 4, 9, 5, 10, "#f1c40f"); // tag

  // ===== ADULT DOG - Fluffy, detailed, bigger =====
  const adultDog = [];
  rect(adultDog, 2, 8, 13, 13, "#b9783c"); // bigger body
  rect(adultDog, 1, 5, 8, 9, "#b9783c"); // bigger head
  // Fluffy fur details
  rect(adultDog, 2, 7, 3, 8, "#d4a574"); // light fur left
  rect(adultDog, 7, 7, 8, 8, "#d4a574"); // light fur right
  rect(adultDog, 3, 11, 4, 12, "#d4a574"); // fluffy chest
  rect(adultDog, 5, 11, 6, 12, "#d4a574"); // fluffy chest
  rect(adultDog, 7, 11, 8, 12, "#d4a574"); // fluffy chest
  rect(adultDog, 0, 3, 2, 6, "#8a5a2b"); // bigger floppy ear L
  rect(adultDog, 7, 3, 9, 6, "#8a5a2b"); // bigger floppy ear R
  rect(adultDog, 2, 6, 3, 7, "#000000"); // eye L
  rect(adultDog, 5, 6, 6, 7, "#000000"); // eye R
  rect(adultDog, 3, 7, 5, 8, "#000000"); // bigger nose
  rect(adultDog, 13, 8, 15, 10, "#b9783c"); // fluffier tail
  rect(adultDog, 14, 7, 16, 8, "#d4a574"); // fluffy tail tip
  rect(adultDog, 3, 13, 5, 16, "#8a5a2b"); // leg L
  rect(adultDog, 9, 13, 11, 16, "#8a5a2b"); // leg R
  rect(adultDog, 1, 8, 8, 9, "#c0392b"); // collar
  rect(adultDog, 4, 9, 5, 10, "#f1c40f"); // tag

  // ===== BABY CAT - Round, simple kitten =====
  const babyCat = [];
  rect(babyCat, 4, 9, 11, 13, "#f39c12"); // small body
  rect(babyCat, 4, 6, 10, 10, "#f39c12"); // round head
  rect(babyCat, 3, 5, 4, 6, "#d35400"); // tiny ear L
  rect(babyCat, 9, 5, 10, 6, "#d35400"); // tiny ear R
  rect(babyCat, 5, 7, 6, 8, "#000000"); // big kitten eye L
  rect(babyCat, 8, 7, 9, 8, "#000000"); // big kitten eye R
  rect(babyCat, 6, 8, 7, 9, "#ff7aa2"); // tiny nose
  rect(babyCat, 11, 10, 12, 12, "#f39c12"); // tiny tail
  rect(babyCat, 5, 13, 6, 14, "#d35400"); // tiny leg

  // ===== TEEN CAT - More defined =====
  const teenCat = [];
  rect(teenCat, 3, 8, 12, 13, "#f39c12"); // body
  rect(teenCat, 2, 5, 7, 9, "#f39c12"); // head
  rect(teenCat, 1, 4, 2, 5, "#d35400"); // ear L
  rect(teenCat, 6, 4, 7, 5, "#d35400"); // ear R
  rect(teenCat, 3, 6, 4, 7, "#000000"); // eye L
  rect(teenCat, 5, 6, 6, 7, "#000000"); // eye R
  rect(teenCat, 4, 7, 5, 8, "#ff7aa2"); // nose
  rect(teenCat, 0, 6, 2, 7, "#ffffff"); // whisker L
  rect(teenCat, 6, 6, 8, 7, "#ffffff"); // whisker R
  rect(teenCat, 12, 9, 14, 11, "#f39c12"); // tail
  rect(teenCat, 4, 13, 5, 15, "#d35400"); // leg L
  rect(teenCat, 9, 13, 10, 15, "#d35400"); // leg R

  // ===== ADULT CAT - Fluffy, luxurious =====
  const adultCat = [];
  rect(adultCat, 2, 7, 13, 13, "#f39c12"); // bigger fluffy body
  rect(adultCat, 1, 4, 8, 9, "#f39c12"); // bigger head
  // Fluffy fur details
  rect(adultCat, 2, 6, 3, 7, "#fbb13c"); // light fur
  rect(adultCat, 6, 6, 7, 7, "#fbb13c"); // light fur
  rect(adultCat, 3, 11, 5, 12, "#fbb13c"); // fluffy chest
  rect(adultCat, 7, 11, 9, 12, "#fbb13c"); // fluffy chest
  rect(adultCat, 13, 9, 14, 11, "#fbb13c"); // fluffy side
  rect(adultCat, 0, 3, 2, 5, "#d35400"); // ear L
  rect(adultCat, 7, 3, 9, 5, "#d35400"); // ear R
  rect(adultCat, 2, 6, 3, 7, "#000000"); // eye L
  rect(adultCat, 5, 6, 6, 7, "#000000"); // eye R
  rect(adultCat, 3, 7, 5, 8, "#ff7aa2"); // nose
  // Long whiskers
  rect(adultCat, 0, 5, 1, 6, "#ffffff"); // whisker L top
  rect(adultCat, 0, 6, 2, 7, "#ffffff"); // whisker L mid
  rect(adultCat, 0, 7, 2, 8, "#ffffff"); // whisker L bottom
  rect(adultCat, 7, 5, 8, 6, "#ffffff"); // whisker R top
  rect(adultCat, 6, 6, 9, 7, "#ffffff"); // whisker R mid
  rect(adultCat, 6, 7, 8, 8, "#ffffff"); // whisker R bottom
  rect(adultCat, 13, 8, 16, 11, "#f39c12"); // big fluffy tail
  rect(adultCat, 14, 7, 16, 8, "#fbb13c"); // fluffy tail tip
  rect(adultCat, 3, 13, 5, 16, "#d35400"); // leg L
  rect(adultCat, 9, 13, 11, 16, "#d35400"); // leg R

  // ===== BABY LIZARD - Small, simple =====
  const babyLizard = [];
  rect(babyLizard, 5, 9, 11, 12, "#27ae60"); // small body
  rect(babyLizard, 4, 8, 6, 10, "#27ae60"); // small head
  rect(babyLizard, 4, 9, 5, 10, "#000000"); // eye
  rect(babyLizard, 11, 10, 13, 11, "#2ecc71"); // tiny tail
  rect(babyLizard, 6, 12, 7, 13, "#1e8f4f"); // tiny leg
  rect(babyLizard, 9, 12, 10, 13, "#1e8f4f"); // tiny leg

  // ===== TEEN LIZARD - More defined =====
  const teenLizard = [];
  rect(teenLizard, 3, 8, 13, 12, "#27ae60"); // long body
  rect(teenLizard, 2, 7, 5, 10, "#27ae60"); // head
  rect(teenLizard, 3, 8, 4, 9, "#000000"); // eye
  rect(teenLizard, 13, 9, 15, 10, "#2ecc71"); // tail 1
  rect(teenLizard, 15, 10, 16, 11, "#2ecc71"); // tail 2
  rect(teenLizard, 5, 12, 6, 13, "#1e8f4f"); // leg 1
  rect(teenLizard, 7, 12, 8, 13, "#1e8f4f"); // leg 2
  rect(teenLizard, 9, 12, 10, 13, "#1e8f4f"); // leg 3
  rect(teenLizard, 11, 12, 12, 13, "#1e8f4f"); // leg 4
  rect(teenLizard, 1, 6, 7, 7, "#caa472"); // hat brim
  rect(teenLizard, 3, 4, 5, 6, "#caa472"); // hat crown
  rect(teenLizard, 3, 6, 5, 7, "#8d6e4f"); // hat band

  // ===== ADULT LIZARD - Bigger with spikes =====
  const adultLizard = [];
  rect(adultLizard, 2, 8, 14, 12, "#27ae60"); // bigger body
  rect(adultLizard, 1, 6, 5, 10, "#27ae60"); // bigger head
  rect(adultLizard, 2, 8, 3, 9, "#000000"); // eye
  // Spikes/scales on back
  rect(adultLizard, 5, 7, 6, 8, "#2ecc71"); // spike
  rect(adultLizard, 7, 7, 8, 8, "#2ecc71"); // spike
  rect(adultLizard, 9, 7, 10, 8, "#2ecc71"); // spike
  rect(adultLizard, 11, 7, 12, 8, "#2ecc71"); // spike
  rect(adultLizard, 14, 9, 16, 11, "#2ecc71"); // long tail
  rect(adultLizard, 4, 12, 5, 14, "#1e8f4f"); // leg 1
  rect(adultLizard, 6, 12, 7, 14, "#1e8f4f"); // leg 2
  rect(adultLizard, 9, 12, 10, 14, "#1e8f4f"); // leg 3
  rect(adultLizard, 11, 12, 12, 14, "#1e8f4f"); // leg 4
  rect(adultLizard, 0, 5, 7, 6, "#caa472"); // bigger hat brim
  rect(adultLizard, 2, 3, 5, 5, "#caa472"); // bigger hat crown
  rect(adultLizard, 2, 5, 5, 6, "#8d6e4f"); // hat band

  return { babyDog, teenDog, adultDog, babyCat, teenCat, adultCat, babyLizard, teenLizard, adultLizard };
};

const PIXEL_DATA = buildPixels();

/**
 * Get dog pixels based on stage
 */
const getDogPixels = (stage) => {
  switch (stage) {
    case 1: return PIXEL_DATA.babyDog;
    case 2: return PIXEL_DATA.teenDog;
    case 3: return PIXEL_DATA.adultDog;
    default: return PIXEL_DATA.babyDog;
  }
};

/**
 * Get cat pixels based on stage
 */
const getCatPixels = (stage) => {
  switch (stage) {
    case 1: return PIXEL_DATA.babyCat;
    case 2: return PIXEL_DATA.teenCat;
    case 3: return PIXEL_DATA.adultCat;
    default: return PIXEL_DATA.babyCat;
  }
};

/**
 * Get lizard pixels based on stage
 */
const getLizardPixels = (stage) => {
  switch (stage) {
    case 1: return PIXEL_DATA.babyLizard;
    case 2: return PIXEL_DATA.teenLizard;
    case 3: return PIXEL_DATA.adultLizard;
    default: return PIXEL_DATA.babyLizard;
  }
};

export const PixelDog = ({ stage = 1 }) => (
  <PixelArt pixels={getDogPixels(stage)} />
);

export const PixelCat = ({ stage = 1 }) => (
  <PixelArt pixels={getCatPixels(stage)} />
);

export const PixelLizard = ({ stage = 1 }) => (
  <PixelArt pixels={getLizardPixels(stage)} />
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
