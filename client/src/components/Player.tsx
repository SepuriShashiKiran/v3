import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  run = 'run',
  crouch = 'crouch',
  interact = 'interact',
  gadget1 = 'gadget1',
  gadget2 = 'gadget2',
  gadget3 = 'gadget3',
  pause = 'pause',
  hack = 'hack'
}


export default function Player() {
  const playerRef = useRef<THREE.Group>(null);
  const [subscribe, get] = useKeyboardControls<Controls>();
  
  const { 
    position, 
    setPosition, 
    health, 
    stealthMode, 
    setStealthMode,
    isRunning,
    setIsRunning,
    isCrouching,
    setIsCrouching
  } = usePlayer();
  
  const { timeOfDay } = useGameState();
  const { playHit } = useAudio();

  const [velocity, setVelocity] = useState(new THREE.Vector3());
  const [footstepTimer, setFootstepTimer] = useState(0);

  // Movement and game loop
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const controls = get();
    const moveSpeed = isRunning ? 8 : (isCrouching ? 2 : 4);
    const currentVelocity = new THREE.Vector3();

    // Handle movement input
    if (controls.forward) {
      currentVelocity.z -= moveSpeed * delta;
      console.log("Moving forward");
    }
    if (controls.backward) {
      currentVelocity.z += moveSpeed * delta;
      console.log("Moving backward");
    }
    if (controls.leftward) {
      currentVelocity.x -= moveSpeed * delta;
      console.log("Moving left");
    }
    if (controls.rightward) {
      currentVelocity.x += moveSpeed * delta;
      console.log("Moving right");
    }

    // Handle running
    if (controls.run && (controls.forward || controls.backward || controls.leftward || controls.rightward)) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }

    // Handle crouching
    if (controls.crouch) {
      setIsCrouching(true);
      setStealthMode(true);
    } else {
      setIsCrouching(false);
      // Stealth mode based on time of day and movement
      const isNight = timeOfDay < 0.3 || timeOfDay > 0.7;
      const isMovingSlowly = !isRunning;
      setStealthMode(isNight && isMovingSlowly);
    }

    // Apply movement
    if (currentVelocity.length() > 0) {
      const newPosition: [number, number, number] = [
        position[0] + currentVelocity.x,
        position[1],
        position[2] + currentVelocity.z
      ];
      
      setPosition(newPosition);
      playerRef.current.position.set(...newPosition);

      // Footstep sounds
      setFootstepTimer(prev => prev + delta);
      if (footstepTimer > (isRunning ? 0.3 : 0.6)) {
        // Simulate footstep sound
        setFootstepTimer(0);
      }
    }

    // Apply crouching animation
    const targetScale = isCrouching ? 0.7 : 1.0;
    playerRef.current.scale.lerp(new THREE.Vector3(1, targetScale, 1), 0.1);

    // Apply stealth visual effect
    if (playerRef.current.children.length > 0) {
      playerRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
          const targetOpacity = stealthMode ? 0.6 : 1.0;
          if ('opacity' in child.material) {
            child.material.transparent = stealthMode;
            child.material.opacity = THREE.MathUtils.lerp(
              child.material.opacity || 1,
              targetOpacity,
              0.1
            );
          }
        }
      });
    }
  });

  // Handle keyboard subscriptions for non-movement actions
  useEffect(() => {
    const unsubscribeInteract = subscribe(
      (state) => state.interact,
      (pressed) => {
        if (pressed) {
          console.log("Interact key pressed - looking for interactive objects");
          // Interaction logic will be handled by nearby objects
        }
      }
    );

    const unsubscribeGadget1 = subscribe(
      (state) => state.gadget1,
      (pressed) => {
        if (pressed) {
          console.log("Gadget 1 activated - Mini Drone");
          // Will be handled by Gadgets component
        }
      }
    );

    const unsubscribeHack = subscribe(
      (state) => state.hack,
      (pressed) => {
        if (pressed) {
          console.log("Hack key pressed - looking for hackable objects");
          // Hacking logic will be handled by nearby objects
        }
      }
    );

    return () => {
      unsubscribeInteract();
      unsubscribeGadget1();
      unsubscribeHack();
    };
  }, [subscribe]);

  return (
    <group ref={playerRef} position={position}>
      {/* Ayaan Malik - Teenage Journalist Character */}
      <group>
        {/* Body */}
        <mesh position={[0, 1, 0]} castShadow>
          <capsuleGeometry args={[0.4, 1.2]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <sphereGeometry args={[0.25]} />
          <meshStandardMaterial color="#f4c2a1" />
        </mesh>
        
        {/* Sunglasses */}
        <mesh position={[0, 1.85, 0.2]} castShadow>
          <boxGeometry args={[0.4, 0.15, 0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.6, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.8]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        <mesh position={[0.6, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.8]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.2, 0.3, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.6]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[0.2, 0.3, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.6]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>

      {/* Stealth indicator */}
      {stealthMode && (
        <mesh position={[0, 2.5, 0]}>
          <ringGeometry args={[0.8, 1.0, 8]} />
          <meshBasicMaterial color="#00ff41" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Player light (flashlight effect) */}
      <spotLight
        position={[0, 1.5, 0.5]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={stealthMode ? 0.1 : 0.5}
        distance={10}
        color="#ffffff"
        castShadow
      />
    </group>
  );
}
