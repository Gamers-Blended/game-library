// Component: Lights
// Def: Lights for our canvas

import React from "react";

const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={3} /> //
      Top-right-front
      <directionalLight position={[-10, 10, -10]} intensity={3} /> //
      Top-left-back
      {/* Fill lights for softer shadows */}
      <directionalLight position={[-10, 10, 10]} intensity={1} /> //
      Top-left-front
      <directionalLight position={[10, 10, -10]} intensity={1} /> //
      Top-right-back
      {/* Point lights for additional dimension */}
      <pointLight position={[0, 15, 0]} intensity={2} /> // Top
      <pointLight position={[0, -15, 0]} intensity={2} /> // Bottom
      <pointLight position={[15, 0, 0]} intensity={2} /> // Right
      <pointLight position={[-15, 0, 0]} intensity={2} /> // Left
      <pointLight position={[0, 0, 15]} intensity={2} /> // Front
      <pointLight position={[0, 0, -15]} intensity={2} /> // Back
    </>
  );
};

export default Lights;
