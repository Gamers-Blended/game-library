import React from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SUBTRACTION, Brush, Evaluator } from "three-bvh-csg";

export default function Model() {
  // disc cover
  const [discFrontImage, discBackImage] = useTexture([
    "/models/ps4_fallout4_disc.jpg",
    "/models/blu_ray_back.jpg",
  ]);

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
