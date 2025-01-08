// Component: Lights
// Def: Lights for our canvas

import React from "react";

const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      {/* Top-right-front */}
      <directionalLight position={[10, 10, 10]} intensity={3} />
      {/* Top-left-back */}
      <directionalLight position={[-10, 10, -10]} intensity={3} />
      {/* Fill lights for softer shadows */}
      {/* Top-left-front */}
      <directionalLight position={[-10, 10, 10]} intensity={1} />
      {/* Top-right-back */}
      <directionalLight position={[10, 10, -10]} intensity={1} />

      {/* Point lights for additional dimension */}
      {/* Top */}
      <pointLight position={[0, 15, 0]} intensity={2} />
      {/* Bottom */}
      <pointLight position={[0, -15, 0]} intensity={2} />
      {/* Right */}
      <pointLight position={[15, 0, 0]} intensity={2} />
      {/* Left */}
      <pointLight position={[-15, 0, 0]} intensity={2} />
      {/* Front */}
      <pointLight position={[0, 0, 15]} intensity={2} />
      {/* Back */}
      <pointLight position={[0, 0, -15]} intensity={2} />
    </>
  );
};

export default Lights;
