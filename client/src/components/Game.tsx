import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import Player from "./Player";
import Environment from "./Environment";
import Enemy from "./Enemy";
import Gadgets from "./Gadgets";
import Level1Manager from "./Level1Manager";
import { useGameState } from "../lib/stores/useGameState";
import { usePlayer } from "../lib/stores/usePlayer";
import { useAudio } from "../lib/stores/useAudio";

export default function Game() {
  const groupRef = useRef<THREE.Group>(null);
  const { dayNightCycle, timeOfDay, updateTimeOfDay } = useGameState();
  const { position } = usePlayer();
  const { playHit, playSuccess } = useAudio();
  
  // Lighting system with day-night cycle
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state, delta) => {
    // Update day-night cycle
    if (dayNightCycle) {
      updateTimeOfDay(delta);
    }

    // Update lighting based on time of day
    if (ambientLightRef.current && directionalLightRef.current) {
      const nightIntensity = 0.1;
      const dayIntensity = 0.8;
      const currentIntensity = nightIntensity + (dayIntensity - nightIntensity) * timeOfDay;
      
      ambientLightRef.current.intensity = currentIntensity * 0.3;
      directionalLightRef.current.intensity = currentIntensity;
      
      // Color temperature changes
      const nightColor = new THREE.Color(0x4169e1); // Dark blue
      const dayColor = new THREE.Color(0xffffff);   // White
      
      directionalLightRef.current.color.lerpColors(nightColor, dayColor, timeOfDay);
    }

    // Camera follow logic (cinematic spy camera)
    const camera = state.camera;
    const idealPosition = new THREE.Vector3(
      position[0],
      position[1] + 3,
      position[2] + 8
    );
    
    camera.position.lerp(idealPosition, 0.02);
    camera.lookAt(position[0], position[1] + 1, position[2]);
  });

  useEffect(() => {
    console.log("Game component initialized");
    console.log("Time of day:", timeOfDay, "Day/Night cycle:", dayNightCycle);
  }, [timeOfDay, dayNightCycle]);

  return (
    <group ref={groupRef}>
      {/* Lighting System */}
      <ambientLight ref={ambientLightRef} intensity={0.2} color="#4169e1" />
      <directionalLight 
        ref={directionalLightRef}
        position={[100, 100, 50]} 
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={500}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* Atmospheric fog for spy thriller mood */}
      <fog attach="fog" args={['#0a0a0a', 50, 200]} />

      {/* Game World */}
      <Environment />
      
      {/* Player Character */}
      <Player />
      
      {/* Enemies */}
      <Enemy position={[10, 0, 10]} patrolRoute={[[10, 0, 10], [10, 0, 20], [20, 0, 20], [20, 0, 10]]} />
      <Enemy position={[-15, 0, 5]} patrolRoute={[[-15, 0, 5], [-15, 0, -5], [-25, 0, -5], [-25, 0, 5]]} />
      <Enemy position={[0, 0, -20]} patrolRoute={[[0, 0, -20], [5, 0, -20], [5, 0, -30], [0, 0, -30]]} />
      
      {/* Interactive Gadgets */}
      <Gadgets />
    </group>
  );
}
