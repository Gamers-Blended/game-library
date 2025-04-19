import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "react-three-fiber";
import * as THREE from "three";

export default function Placeholder() {
  const spinnerRef = useRef();

  // Animation loop
  useFrame(() => {
    if (spinnerRef.current) {
      spinnerRef.current.rotation.z -= 0.02;
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

  // Loading text component
  function LoadingText({ fontSize = 5, color = "#000000" }) {
    const { camera, gl } = useThree();

    const canvasTexture = useMemo(() => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const resolutionMultiplier = 10; // Higher value -> higher resolution
      canvas.width = 256 * resolutionMultiplier;
      canvas.height = 64 * resolutionMultiplier;

      context.scale(resolutionMultiplier, resolutionMultiplier); // Scale context

      // Fill with transparent background
      context.fillStyle = "rgba(0,0,0,0)";
      context.fillRect(
        0,
        0,
        canvas.width / resolutionMultiplier,
        canvas.height / resolutionMultiplier
      );

      // Add text
      context.font = `bold ${fontSize}px Arial, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = color;
      context.fillText(
        "LOADING...",
        canvas.width / (2 * resolutionMultiplier),
        canvas.height / (2 * resolutionMultiplier)
      );

      // Create texture
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      return texture;
    }, [fontSize, color]);

    // Set Sprite position
    const centerWorldPosition = useMemo(() => {
      const vector = new THREE.Vector3();
      vector.set(0, 0, -1); // Position in front of the camera
      vector.unproject(camera);

      const dir = vector.sub(camera.position).normalize();
      const distance = camera.position.length() / 2;
      const center = camera.position.clone().add(dir.multiplyScalar(distance));
      return center;
    }, [camera, gl]);

    return (
      <sprite position={centerWorldPosition} scale={[3, 1, 1]}>
        <spriteMaterial map={canvasTexture} transparent />
      </sprite>
    );
  }

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

      <LoadingText />
    </group>
  );
}
