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
import { useValidatedSupabaseImage, preloadImage } from "../utils/imageUtils";
import Placeholder from "./placeholder.jsx";

// sounds
import caseOpenSound from "../../assets/sound/open-case.mp3";
import caseCloseSound from "../../assets/sound/close-case.mp3";

function CaseContent({ frontImageUrl, backImageUrl, spineImageUrl }) {
  const snap = useSnapshot(state);
  const openCase = new Audio(caseOpenSound);
  const closeCase = new Audio(caseCloseSound);
  const { nodes, materials } = useGLTF("../../../models/case.glb");
  const loadTextures = useTexture([frontImageUrl, backImageUrl, spineImageUrl]);
  const [coverFrontImage, coverBackImage, coverSpineImage] = loadTextures;

  coverFrontImage.colorSpace = THREE.SRGBColorSpace;
  coverBackImage.colorSpace = THREE.SRGBColorSpace;
  coverSpineImage.colorSpace = THREE.SRGBColorSpace;

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
          <meshStandardMaterial map={coverFrontImage} />
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
          <meshStandardMaterial map={coverSpineImage} />
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
          <meshStandardMaterial map={coverBackImage} />
        </mesh>
      </group>
    </group>
  );
}

export default function Model() {
  const snap = useSnapshot(state);
  const JPG = "jpg";

  const frontImageUrl = useValidatedSupabaseImage(
    `images/${snap.platform}/${snap.region}/cover/${snap.platform}_${snap.title}_${snap.region}_${snap.edition}_front_cover.${JPG}`
  );

  const backImageUrl = useValidatedSupabaseImage(
    `images/${snap.platform}/${snap.region}/cover/${snap.platform}_${snap.title}_${snap.region}_${snap.edition}_back_cover.${JPG}`
  );

  const spineImageUrl = useValidatedSupabaseImage(
    `images/${snap.platform}/${snap.region}/cover/${snap.platform}_${snap.title}_${snap.region}_${snap.edition}_spine_cover.${JPG}`
  );

  // Placeholder while loading
  if (!frontImageUrl || !backImageUrl || !spineImageUrl) {
    return <Placeholder />;
  }

  preloadImage(frontImageUrl);
  preloadImage(backImageUrl);
  preloadImage(spineImageUrl);

  return (
    <CaseContent
      frontImageUrl={frontImageUrl}
      backImageUrl={backImageUrl}
      spineImageUrl={spineImageUrl}
    />
  );
}

useGLTF.preload("../../../models/case.glb");
