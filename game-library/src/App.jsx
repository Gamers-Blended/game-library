import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./assets/styles/App.scss";
import Model from "./components/Three/case.jsx";
import Lights from "./components/Three/lights.jsx";
import HeaderUI from "./components/Three/headerUI.jsx";

function App() {
  // This flag controls open state, alternates between true & false
  const [open, setOpen] = useState(false);

  return (
    <>
      <HeaderUI />
      <Canvas shadows camera={{ position: [0, 4, 8], fov: 35 }}>
        <Lights />
        <Suspense fallback={null}>
          <Model open={open} setOpen={setOpen} />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </>
  );
}

export default App;
