import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader, OrbitControls } from "@react-three/drei";
import { state } from "./components/Three/store";
import { useSnapshot } from "valtio";
import "./assets/styles/App.scss";
import Lights from "./components/Three/lights.jsx";
import UI from "./components/Three/ui.jsx";
import MetaDataHandler from "./components/Three/metaDataHandler.jsx";
import ModeSelector from "./components/Three/modeSelector.jsx";
import ModelSelector from "./components/Three/modelSelector.jsx";
import ImageModeSelector from "./components/Three/imageModeSelector.jsx";

function App() {
  const snap = useSnapshot(state);

  return (
    <>
      {snap.isMetaDataHandlerOpened && <MetaDataHandler />}
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
      <ImageModeSelector />
    </>
  );
}

export default App;
