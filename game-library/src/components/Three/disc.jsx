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

  const brush1 = new Brush(new THREE.CylinderGeometry(1, 1, 0.01, 64));
  brush1.updateMatrixWorld();

  const brush2 = new Brush(new THREE.CylinderGeometry(0.15, 0.15));
  brush2.updateMatrixWorld();

  const evaluator = new Evaluator();
  const result = evaluator.evaluate(brush1, brush2, SUBTRACTION);
  const discGeometry = result.geometry;

  return (
    <group dispose={null}>
      <mesh geometry={discGeometry} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
        <meshStandardMaterial map={discFrontImage} />
      </mesh>

      <mesh
        geometry={discGeometry}
        position={[0, 0, -0.01]}
        scale={[-1, 1, -1]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial map={discBackImage} />
      </mesh>
    </group>
  );
}
