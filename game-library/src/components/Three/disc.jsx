import React from "react";
import { useSnapshot } from "valtio";
import { state } from "./store";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SUBTRACTION, Brush, Evaluator } from "three-bvh-csg";
import { useValidatedSupabaseImage, preloadImage } from "../utils/imageUtils";

function DiscContent({ frontImageUrl, backImageUrl }) {
  const loadTextures = useTexture([frontImageUrl, backImageUrl]);
  const [discFrontImage, discBackImage] = loadTextures;

  discFrontImage.repeat.set(1, 1);
  discBackImage.repeat.set(1, 1);

  const brushWholeDisc = new Brush(new THREE.CylinderGeometry(1, 1, 0.01, 64));
  brushWholeDisc.updateMatrixWorld();

  const brushInnerDisc = new Brush(new THREE.CylinderGeometry(0.15, 0.15));
  brushInnerDisc.updateMatrixWorld();

  const evaluator = new Evaluator();
  const discGeometry = evaluator.evaluate(
    brushWholeDisc,
    brushInnerDisc,
    SUBTRACTION
  ).geometry;

  const brushWholeRing = new Brush(
    new THREE.CylinderGeometry(0.1499, 0.1499, 0.02, 64)
  );
  brushWholeRing.updateMatrixWorld();

  const brushInnerRing = new Brush(
    new THREE.CylinderGeometry(0.149, 0.149, 0.02, 64)
  );
  brushInnerRing.updateMatrixWorld();

  const innerRing = evaluator.evaluate(
    brushWholeRing,
    brushInnerRing,
    SUBTRACTION
  ).geometry;

  return (
    <group dispose={null}>
      {/* disc front */}
      <mesh geometry={discGeometry} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
        <meshStandardMaterial map={discFrontImage} />
      </mesh>

      {/* disc back */}
      <mesh
        geometry={discGeometry}
        position={[0, 0, -0.01]}
        scale={[-1, 1, -1]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial map={discBackImage} />
      </mesh>

      {/* disc inner ring */}
      <mesh
        geometry={innerRing}
        position={[0, 0, -0.005]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial map={discBackImage} />
      </mesh>
    </group>
  );
}

export default function Model() {
  const snap = useSnapshot(state);
  const JPG = "jpg";

  const frontImageUrl = useValidatedSupabaseImage(
    `images/${snap.platform}/${snap.region}/disc/${snap.platform}_${snap.title}_${snap.region}_${snap.edition}_disc.${JPG}`
  );

  const backImageUrl = useValidatedSupabaseImage(
    `images/${snap.platform}/${snap.region}/disc/${snap.platform}_back.${JPG}`
  );

  // Placeholder while loading
  if (!frontImageUrl || !backImageUrl) {
    return (
      <mesh>
        <cylinderGeometry
          args={[1, 1, 0.01, 64]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <meshStandardMaterial color="white" />
      </mesh>
    );
  }

  preloadImage(frontImageUrl);
  preloadImage(backImageUrl);

  return (
    <DiscContent frontImageUrl={frontImageUrl} backImageUrl={backImageUrl} />
  );
}
