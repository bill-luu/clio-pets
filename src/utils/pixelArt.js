import React from "react";

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

const getLizardColorFilter = (colorName) => {
  switch ((colorName || "green").toLowerCase()) {
    case "green":
      return "none";
    case "yellow":
    case "blue":
      return "hue-rotate(110deg) saturate(160%)";
    case "pink":
    case "purple":
      return "hue-rotate(210deg) saturate(160%)";
    case "white":
      return "saturate(0%) brightness(175%)";
    case "orange":
      return "hue-rotate(260deg) saturate(160%)";
    case "brown":
      return "hue-rotate(330deg) saturate(70%) brightness(70%)";
    default:
      return "none";
  }
};

// Color filters for owls (base sprite is blue)
const getOwlColorFilter = (colorName) => {
  switch ((colorName || "blue").toLowerCase()) {
    case "blue":
      return "none";
    case "green":
      return "hue-rotate(240deg) saturate(150%) brightness(105%)";
    case "yellow":
      return "hue-rotate(140deg) saturate(220%) brightness(115%) contrast(105%)";
    case "purple":
      return "hue-rotate(60deg) saturate(170%)";
    case "white":
      return "saturate(0%) brightness(175%)";
    case "orange":
      return "hue-rotate(150deg) saturate(300%)";
    case "brown":
      return "hue-rotate(150deg) saturate(80%) brightness(60%)";
    case "pink":
      return "hue-rotate(320deg) saturate(180%)";
    default:
      return "none";
  }
};

const AnimatedAdultDog = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div
      className="pixelart-dog-adult"
      aria-label="Adult Dog"
      style={{ filter: getDogColorFilter(color) }}
    />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

// Placeholder adult dog with hat variant (loads a blank placeholder class for now)
const AnimatedAdultDogWithHat = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div
      className="pixelart-dog-with-hat"
      aria-label="Adult Dog With Hat"
      style={{ filter: getDogColorFilter(color) }}
    />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedTeenDog = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div
      className="pixelart-dog-teen"
      aria-label="Teen Dog"
      style={{ filter: getDogColorFilter(color) }}
    />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedBabyDog = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div
      className="pixelart-dog-baby"
      aria-label="Baby Dog"
      style={{ filter: getDogColorFilter(color) }}
    />
    {isSad && (
      <div
        aria-hidden="true"
        className="attention-emoji"
        style={{
          position: "absolute",
          top: -8,
          right: -8,
          fontSize: 42,
          pointerEvents: "none",
        }}
      >
        😢
      </div>
    )}
    {isExhausted && (
      <div
        aria-hidden="true"
        className="attention-emoji"
        style={{
          position: "absolute",
          top: -8,
          left: -8,
          fontSize: 40,
          pointerEvents: "none",
        }}
      >
        💤
      </div>
    )}
    {isDirty && (
      <div
        aria-hidden="true"
        className="attention-emoji"
        style={{
          position: "absolute",
          bottom: -8,
          left: -8,
          fontSize: 38,
          pointerEvents: "none",
        }}
      >
        💩
      </div>
    )}
  </div>
);

export const PixelDog = ({ stage = 1, color = "brown", isSad = false, isDirty = false, isExhausted = false, equippedAccessories = [] }) => {
  const hasHatEquipped = Array.isArray(equippedAccessories) && equippedAccessories.includes("Hat");
  if (stage === 3) {
    return hasHatEquipped
      ? <AnimatedAdultDogWithHat color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />
      : <AnimatedAdultDog color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  if (stage === 2) {
    return <AnimatedTeenDog color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  return <AnimatedBabyDog color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
};

const AnimatedAdultCat = ({ isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-to-css" aria-label="Adult Cat" />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedTeenCat = ({ isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-teen-cat" aria-label="Teen Cat" />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedBabyCat = ({ isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-baby-cat" aria-label="Baby Cat" />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

// Adult cat with hat (placeholder variant)
const AnimatedAdultCatWithHat = ({ isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-cat-with-hat" aria-label="Adult Cat With Hat" />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

export const PixelCat = ({ stage = 1, isSad = false, isDirty = false, isExhausted = false, equippedAccessories = [] }) => {
  const hasHatEquipped = Array.isArray(equippedAccessories) && equippedAccessories.includes("Hat");
  if (stage === 3) {
    return hasHatEquipped
      ? <AnimatedAdultCatWithHat isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />
      : <AnimatedAdultCat isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  if (stage === 2) {
    return <AnimatedTeenCat isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  return <AnimatedBabyCat isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
};

const AnimatedAdultLizard = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-lizard-adult" aria-label="Adult Lizard" style={{ filter: getLizardColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedTeenLizard = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-lizard-teen" aria-label="Teen Lizard" style={{ filter: getLizardColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedBabyLizard = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-lizard-baby" aria-label="Baby Lizard" style={{ filter: getLizardColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

// Adult lizard with hat (placeholder variant)
const AnimatedAdultLizardWithHat = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-lizard-with-hat" aria-label="Adult Lizard With Hat" style={{ filter: getLizardColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

export const PixelLizard = ({ stage = 1, color = "green", isSad = false, isDirty = false, isExhausted = false, equippedAccessories = [] }) => {
  const hasHatEquipped = Array.isArray(equippedAccessories) && equippedAccessories.includes("Hat");
  if (stage === 3) {
    return hasHatEquipped
      ? <AnimatedAdultLizardWithHat color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />
      : <AnimatedAdultLizard color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  if (stage === 2) {
    return <AnimatedTeenLizard color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  return <AnimatedBabyLizard color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
};

const AnimatedAdultBird = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bird-adult" aria-label="Adult Bird" style={{ filter: getBirdColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

// Adult bird with hat (placeholder variant)
const AnimatedAdultBirdWithHat = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bird-with-hat" aria-label="Adult Bird With Hat" style={{ filter: getBirdColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedTeenBird = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bird-teen" aria-label="Teen Bird" style={{ filter: getBirdColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedBabyBird = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bird-baby" aria-label="Baby Bird" style={{ filter: getBirdColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

export const PixelBird = ({ stage = 1, color = "yellow", isSad = false, isDirty = false, isExhausted = false, equippedAccessories = [] }) => {
  const hasHatEquipped = Array.isArray(equippedAccessories) && equippedAccessories.includes("Hat");
  if (stage === 3) {
    return hasHatEquipped
      ? <AnimatedAdultBirdWithHat color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />
      : <AnimatedAdultBird color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  if (stage === 2) {
    return <AnimatedTeenBird color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  return <AnimatedBabyBird color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
};

const AnimatedBabyBunny = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bunny-baby" aria-label="Baby Bunny" style={{ filter: getBunnyColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedTeenBunny = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bunny-teen" aria-label="Teen Bunny" style={{ filter: getBunnyColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedAdultBunny = ({ color, isSad, isDirty, isExhausted }) => (

  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-bunny-adult" aria-label="Adult Bunny" style={{ filter: getBunnyColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

// Adult bunny with hat (placeholder variant)
const AnimatedAdultBunnyWithHat = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div
      className="pixelart-bunny-with-hat"
      aria-label="Adult Bunny With Hat"
      style={{ filter: getBunnyColorFilter(color) }}
    />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

export const PixelBunny = ({ stage = 1, color = "pink", isSad = false, isDirty = false, isExhausted = false, equippedAccessories = [] }) => {
  const hasHatEquipped = Array.isArray(equippedAccessories) && equippedAccessories.includes("Hat");
  if (stage === 3) {
    return hasHatEquipped
      ? <AnimatedAdultBunnyWithHat color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />
      : <AnimatedAdultBunny color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  if (stage === 2) {
    return <AnimatedTeenBunny color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  return <AnimatedBabyBunny color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
};

// Owl (placeholder) - simple components referencing CSS classes you can animate later
const AnimatedAdultOwl = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-owl-adult" aria-label="Adult Owl" style={{ filter: getOwlColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedTeenOwl = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-owl-teen" aria-label="Teen Owl" style={{ filter: getOwlColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

const AnimatedBabyOwl = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-owl-baby" aria-label="Baby Owl" style={{ filter: getOwlColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

// Adult owl with hat (placeholder variant)
const AnimatedAdultOwlWithHat = ({ color, isSad, isDirty, isExhausted }) => (
  <div style={{ position: "relative", width: 170, height: 170 }}>
    <div className="pixelart-owl-with-hat" aria-label="Adult Owl With Hat" style={{ filter: getOwlColorFilter(color) }} />
    {isSad && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, right: -8, fontSize: 42, pointerEvents: "none" }}>😢</div>
    )}
    {isExhausted && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", top: -8, left: -8, fontSize: 40, pointerEvents: "none" }}>💤</div>
    )}
    {isDirty && (
      <div aria-hidden="true" className="attention-emoji" style={{ position: "absolute", bottom: -8, left: -8, fontSize: 38, pointerEvents: "none" }}>💩</div>
    )}
  </div>
);

export const PixelOwl = ({ stage = 1, color = "blue", isSad = false, isDirty = false, isExhausted = false, equippedAccessories = [] }) => {
  const hasHatEquipped = Array.isArray(equippedAccessories) && equippedAccessories.includes("Hat");
  if (stage === 3) {
    return hasHatEquipped
      ? <AnimatedAdultOwlWithHat color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />
      : <AnimatedAdultOwl color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  if (stage === 2) {
    return <AnimatedTeenOwl color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
  }
  return <AnimatedBabyOwl color={color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />;
};

// Available pet species with their pixel art components
export const PET_SPECIES = [
  { value: "Dog", label: "Dog", Component: PixelDog },
  { value: "Cat", label: "Cat", Component: PixelCat },
  { value: "Bird", label: "Bird", Component: PixelBird },
  { value: "Bunny", label: "Bunny", Component: PixelBunny },
  { value: "Lizard", label: "Lizard", Component: PixelLizard },
  { value: "Owl", label: "(Draw the) Owl", Component: PixelOwl },
];

// Get pixel art component for a species
export const getPetPixelArt = (species) => {
  const pet = PET_SPECIES.find((p) => p.value === species);
  return pet ? pet.Component : null;
};
