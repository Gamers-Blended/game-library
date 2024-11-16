import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { state } from "./components/Three/store";
import "./assets/styles/App.scss";
import Model from "./components/Three/case.jsx";
import Lights from "./components/Three/lights.jsx";
import HeaderUI from "./components/Three/headerUI.jsx";
import ModeSelector from "./components/Three/modeSelector.jsx";
import CoverViewer from "./components/Three/coverViewer.jsx";

function App() {
  const [open, setOpen] = useState(false);
  const snap = useSnapshot(state);

  return (
    <>
      <ModeSelector />
      <HeaderUI />
      <Canvas shadows camera={{ position: [0, 4, 8], fov: 35 }}>
        <Lights />
        <Suspense fallback={null}>
          <Model open={open} setOpen={setOpen} />
          <OrbitControls />
        </Suspense>
      </Canvas>
      {snap.currentMode == "COVER" && <CoverViewer />}
    </>
  );
}

export default App;
