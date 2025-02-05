import React, { useRef } from "react";
import { useFrame } from "react-three-fiber";

export default function Placeholder() {
  const placeholderRef = useRef();

  useFrame(() => {
    if (placeholderRef.current) {
      placeholderRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={placeholderRef} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[1, 1, 0.01, 64]} />
      <meshBasicMaterial
        color="#34495e"
        wireframe={true}
        wireframeLinewidth={2}
      />
    </mesh>
  );
}
