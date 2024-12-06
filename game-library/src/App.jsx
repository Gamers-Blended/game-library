import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader, OrbitControls } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { state } from "./components/Three/store";
import "./assets/styles/App.scss";
import ModelSelector from "./components/Three/modelSelector.jsx";
import Lights from "./components/Three/lights.jsx";
import UI from "./components/Three/ui.jsx";
import MetaDataHandler from "./components/Three/metaDataHandler.jsx";
import ModeSelector from "./components/Three/modeSelector.jsx";
import CoverViewer from "./components/Three/coverViewer.jsx";

function App() {
  const snap = useSnapshot(state);

  return (
    <>
      <MetaDataHandler />
      <ModeSelector />
      <UI />
      <Loader />
      <Canvas shadows camera={{ position: [0, 4, 8], fov: 35 }}>
        <Lights />
        <Suspense fallback={null}>
          <ModelSelector />
          <OrbitControls />
        </Suspense>
      </Canvas>
      {snap.currentMode == "COVER" && <CoverViewer />}
    </>
  );
}

export default App;
