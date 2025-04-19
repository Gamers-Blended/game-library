import React, { useRef } from "react";
import { useFrame } from "react-three-fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export default function Placeholder() {
  const spinnerRef = useRef();
  const arcRef = useRef();

  // Animation loop
  useFrame(() => {
    if (spinnerRef.current) {
      spinnerRef.current.rotation.z -= 0.02;
    }
    if (arcRef.current) {
      arcRef.current.rotation.z += 0.05;
    }
  });

  // Create a semicircle curve
  const createSemicircle = () => {
    const radius = 1;
    const points = [];
    const segments = 32;

    // Create points for a semicircle (0 to PI)
    for (let i = 0; i <= segments; i++) {
      const angle = (Math.PI * i) / segments;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  };

  return (
    <group ref={spinnerRef}>
      {/* Semicircle line */}
      <line geometry={createSemicircle()}>
        <lineBasicMaterial color="#ffffff" linewidth={2} />
      </line>

      {/* Small dot at the end of semicircle */}
      <mesh position={[1, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
