// Component: Lights
// Def: Lights for our canvas

import React from "react";

const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-8, 16, -8]} intensity={2.5} />
      <directionalLight position={[2, 5, 2]} intensity={2.5} />
      <pointLight position={[0, 50, 0]} intensity={2} />
      <pointLight position={[0, -1, 0]} intensity={2} />
    </>
  );
};

export default Lights;
