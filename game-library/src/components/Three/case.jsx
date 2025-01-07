/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.15 public/models/case.glb 
*/

import React from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";
import * as THREE from "three";
import { state } from "./store";
import { useSnapshot } from "valtio";

// sounds
import caseOpenSound from "../../assets/sound/open-case.mp3";
import caseCloseSound from "../../assets/sound/close-case.mp3";

export default function Model() {
  const snap = useSnapshot(state);

  // model
  const { nodes, materials } = useGLTF("../../../models/case.glb");

  // case open and close audio
  const openCase = new Audio(caseOpenSound);
  const closeCase = new Audio(caseCloseSound);

  const handleAnimation = () => {
    state.open = !state.open;

    if (snap.open) {
      closeCase.volume = 0.3;
      closeCase.play();
    } else {
      openCase.volume = 0.3;
      openCase.play();
    }
  };

  // top case open animation
  const openCaseAnimation = useSpring({
    // open : close
    rotation: snap.open ? [0, 0, 3] : [0, 0, 0],
  });

  // spine open animation
  const openSpineAnimation = useSpring({
    // open : close
    rotation: snap.open ? [0, 0, 1.61] : [0, 0, 0],
    position: snap.open ? [-1, -0.05, 0] : [-0.942, 0, 0],
  });

  // game cover
  const [foFront, foBack, foSpine] = useTexture([
    "/models/ps4_fallout4_front.jpg",
    "/models/ps4_fallout4_back.jpg",
    "/models/ps4_fallout4_spine.jpg",
  ]);
  foFront.colorSpace = THREE.SRGBColorSpace;
  foBack.colorSpace = THREE.SRGBColorSpace;
  foSpine.colorSpace = THREE.SRGBColorSpace;

  // 3D model
  return (
    <group dispose={null} rotation-x={Math.PI / 2}>
      {/* top case */}
      <a.group rotation={openCaseAnimation.rotation} position={[-1, 0, 0]}>
        <mesh
          geometry={nodes.front_case.geometry}
          material={materials.grey}
          position={[1, 0.05, 0]}
          scale={[0.9, -0.05, -1]}
          onClick={handleAnimation}
        />

        <mesh
          geometry={nodes.front_cover.geometry}
          position={[0.92, 0.105, 0]}
          scale={[0.9, 1, -0.97]}
        >
          <meshStandardMaterial map={foFront} />
        </mesh>
      </a.group>

      {/* spine */}
      <a.group
        rotation={openSpineAnimation.rotation}
        position={openSpineAnimation.position}
      >
        <mesh
          geometry={nodes.spine.geometry}
          material={materials.grey}
          scale={[0.04, 0.1, 1]}
        />

        <mesh
          geometry={nodes.spine_cover.geometry}
          material={nodes.spine_cover.material}
          position={[-0.05, 0, 0]}
          rotation={[0, 0, -Math.PI / 2]}
          scale={[-0.104, -1, -0.97]}
        >
          <meshStandardMaterial map={foSpine} />
        </mesh>
      </a.group>

      {/* bottom case */}
      <group>
        <mesh
          geometry={nodes.back_case.geometry}
          material={materials.grey}
          position={[0, -0.05, 0]}
          rotation={[-Math.PI, 0, -Math.PI]}
          scale={[-0.9, -0.05, -1]}
        />

        <mesh
          geometry={nodes.back_cover.geometry}
          material={nodes.back_cover.material}
          position={[-0.08, -0.103, 0]}
          scale={[-0.9, -1, -0.97]}
        >
          <meshStandardMaterial map={foBack} />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload("../../../models/case.glb");
