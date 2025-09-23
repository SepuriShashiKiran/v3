import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useGameState } from "../lib/stores/useGameState";
import { useInventory } from "../lib/stores/useInventory";

enum Controls {
  interact = 'interact',
}

interface InteractiveObjectProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  name: string;
  description: string;
  onInteract?: () => void;
  interactionDistance?: number;
  children?: React.ReactNode;
  requiredItem?: string;
  unlocked?: boolean;
  type: 'pickup' | 'examine' | 'hack' | 'unlock' | 'puzzle';
}

export default function InteractiveObject({
  position,
  size,
  color,
  name,
  description,
  onInteract,
  interactionDistance = 3,
  children,
  requiredItem,
  unlocked = true,
  type
}: InteractiveObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [subscribe] = useKeyboardControls<Controls>();
  const { position: playerPosition } = usePlayer();
  const { currentObjective, setCurrentObjective } = useGameState();
  const { hasItem, addItem } = useInventory();
  
  const [isPlayerNear, setIsPlayerNear] = useState(false);
  const [showInteractionPrompt, setShowInteractionPrompt] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);

  // Calculate distance to player
  useFrame(() => {
    if (!meshRef.current) return;
    
    const distance = new THREE.Vector3(...playerPosition)
      .distanceTo(new THREE.Vector3(...position));
    
    const wasNear = isPlayerNear;
    const isNear = distance <= interactionDistance;
    
    setIsPlayerNear(isNear);
    setShowInteractionPrompt(isNear && unlocked && (!requiredItem || hasItem(requiredItem)));
    
    // Highlight object when player is near
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      if (isNear && unlocked) {
        meshRef.current.material.emissive.setHex(0x004400);
        meshRef.current.material.emissiveIntensity = 0.3;
      } else {
        meshRef.current.material.emissive.setHex(0x000000);
        meshRef.current.material.emissiveIntensity = 0;
      }
    }
  });

  // Handle interaction key press
  useEffect(() => {
    const unsubscribeInteract = subscribe(
      (state) => state.interact,
      (pressed) => {
        if (pressed && showInteractionPrompt && !isInteracted) {
          handleInteraction();
        }
      }
    );

    return unsubscribeInteract;
  }, [subscribe, showInteractionPrompt, isInteracted]);

  const handleInteraction = () => {
    if (!unlocked) {
      console.log(`${name} is locked`);
      return;
    }

    if (requiredItem && !hasItem(requiredItem)) {
      console.log(`${name} requires ${requiredItem}`);
      return;
    }

    console.log(`Interacting with ${name}`);
    
    // Handle different interaction types
    switch (type) {
      case 'pickup':
        addItem(name.toLowerCase().replace(/\s+/g, '_'));
        setIsInteracted(true);
        break;
      case 'examine':
        // Show examination dialog or advance objective
        break;
      case 'hack':
        // Trigger hacking minigame
        break;
      case 'unlock':
        // Unlock mechanism
        break;
      case 'puzzle':
        // Start puzzle interaction
        break;
    }

    // Call custom interaction handler if provided
    if (onInteract) {
      onInteract();
    }
  };

  // Get interaction text based on type
  const getInteractionText = () => {
    if (!unlocked) return "LOCKED";
    if (requiredItem && !hasItem(requiredItem)) return `REQUIRES ${requiredItem.toUpperCase()}`;
    if (isInteracted && type === 'pickup') return "COLLECTED";
    
    switch (type) {
      case 'pickup': return "PICK UP";
      case 'examine': return "EXAMINE";
      case 'hack': return "HACK [F]";
      case 'unlock': return "UNLOCK";
      case 'puzzle': return "SOLVE";
      default: return "INTERACT [E]";
    }
  };

  return (
    <group position={position}>
      {/* Main object mesh */}
      <mesh 
        ref={meshRef} 
        castShadow 
        receiveShadow
        visible={!(isInteracted && type === 'pickup')}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={unlocked ? color : "#666666"}
          opacity={isInteracted && type === 'pickup' ? 0.3 : 1}
          transparent={isInteracted && type === 'pickup'}
        />
      </mesh>

      {/* Custom children (for complex objects) */}
      {children && !isInteracted && children}

      {/* Interaction prompt */}
      {showInteractionPrompt && (
        <group position={[0, size[1] + 1, 0]}>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.3}
            color="#00ff41"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
          >
            {name.toUpperCase()}
          </Text>
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
          >
            {getInteractionText()}
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.15}
            color="#888888"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter.json"
            maxWidth={8}
            textAlign="center"
          >
            {description}
          </Text>
        </group>
      )}

      {/* Glow effect when highlighted */}
      {isPlayerNear && unlocked && (
        <mesh position={[0, 0, 0]} scale={[1.1, 1.1, 1.1]}>
          <boxGeometry args={size} />
          <meshBasicMaterial 
            color="#00ff41" 
            transparent 
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}