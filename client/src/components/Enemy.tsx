import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

interface EnemyProps {
  position: [number, number, number];
  patrolRoute: [number, number, number][];
  detectionRadius?: number;
  alertRadius?: number;
}


export default function Enemy({ 
  position, 
  patrolRoute, 
  detectionRadius = 8, 
  alertRadius = 15 
}: EnemyProps) {
  const enemyRef = useRef<THREE.Group>(null);
  const detectionSphereRef = useRef<THREE.Mesh>(null);
  const alertSphereRef = useRef<THREE.Mesh>(null);
  
  const [currentPosition, setCurrentPosition] = useState(new THREE.Vector3(...position));
  const [currentTarget, setCurrentTarget] = useState(0);
  const [isAlerted, setIsAlerted] = useState(false);
  const [isChasing, setIsChasing] = useState(false);
  const [lastKnownPlayerPosition, setLastKnownPlayerPosition] = useState<THREE.Vector3 | null>(null);
  const [searchTimer, setSearchTimer] = useState(0);
  
  const { position: playerPosition, stealthMode } = usePlayer();
  const { timeOfDay } = useGameState();
  const { playHit } = useAudio();
  
  // Pre-calculate patrol route as Vector3 objects
  const patrolPoints = useMemo(() => 
    patrolRoute.map(point => new THREE.Vector3(...point)), 
    [patrolRoute]
  );

  useFrame((state, delta) => {
    if (!enemyRef.current) return;

    const playerPos = new THREE.Vector3(...playerPosition);
    const enemyPos = currentPosition.clone();
    const distanceToPlayer = enemyPos.distanceTo(playerPos);

    // Detection logic
    const stealthMultiplier = stealthMode ? 0.5 : 1.0;
    const nightMultiplier = timeOfDay < 0.3 || timeOfDay > 0.7 ? 0.7 : 1.0;
    const effectiveDetectionRadius = detectionRadius * stealthMultiplier * nightMultiplier;

    // Check if player is detected
    const playerDetected = distanceToPlayer < effectiveDetectionRadius && !stealthMode;
    
    if (playerDetected && !isAlerted) {
      setIsAlerted(true);
      setIsChasing(true);
      setLastKnownPlayerPosition(playerPos.clone());
      console.log("Player detected by enemy agent!");
      playHit(); // Alert sound
    }

    // AI State Machine
    if (isChasing) {
      // Chase behavior
      if (distanceToPlayer < effectiveDetectionRadius) {
        // Can see player, update last known position
        setLastKnownPlayerPosition(playerPos.clone());
        setSearchTimer(0);
        
        // Move toward player
        const direction = playerPos.clone().sub(enemyPos).normalize();
        const moveSpeed = 3;
        const newPosition = enemyPos.add(direction.multiplyScalar(moveSpeed * delta));
        setCurrentPosition(newPosition);
        
        // Look at player
        if (enemyRef.current) {
          enemyRef.current.lookAt(playerPos);
        }
      } else if (lastKnownPlayerPosition) {
        // Lost sight, move to last known position
        const direction = lastKnownPlayerPosition.clone().sub(enemyPos);
        
        if (direction.length() > 1) {
          direction.normalize();
          const moveSpeed = 2;
          const newPosition = enemyPos.add(direction.multiplyScalar(moveSpeed * delta));
          setCurrentPosition(newPosition);
          
          if (enemyRef.current) {
            enemyRef.current.lookAt(lastKnownPlayerPosition);
          }
        } else {
          // Reached last known position, start searching
          setSearchTimer(prev => prev + delta);
          
          if (searchTimer > 5) {
            // Give up search, return to patrol
            setIsChasing(false);
            setIsAlerted(false);
            setLastKnownPlayerPosition(null);
            setSearchTimer(0);
            console.log("Enemy lost the player, returning to patrol");
          }
        }
      }
    } else {
      // Patrol behavior
      const targetPoint = patrolPoints[currentTarget];
      const direction = targetPoint.clone().sub(enemyPos);
      
      if (direction.length() > 0.5) {
        // Move toward patrol point
        direction.normalize();
        const moveSpeed = 1.5;
        const newPosition = enemyPos.add(direction.multiplyScalar(moveSpeed * delta));
        setCurrentPosition(newPosition);
        
        // Look in movement direction
        if (enemyRef.current && direction.length() > 0) {
          const lookTarget = enemyPos.clone().add(direction);
          enemyRef.current.lookAt(lookTarget);
        }
      } else {
        // Reached patrol point, move to next
        setCurrentTarget((prev) => (prev + 1) % patrolPoints.length);
      }
    }

    // Update position
    if (enemyRef.current) {
      enemyRef.current.position.copy(currentPosition);
    }

    // Update detection visualization
    if (detectionSphereRef.current && detectionSphereRef.current.material instanceof THREE.MeshBasicMaterial) {
      detectionSphereRef.current.material.opacity = isAlerted ? 0.3 : 0.1;
      detectionSphereRef.current.material.color.setHex(isAlerted ? 0xff0000 : 0xffff00);
    }

    if (alertSphereRef.current && alertSphereRef.current.material instanceof THREE.MeshBasicMaterial) {
      alertSphereRef.current.material.opacity = isChasing ? 0.2 : 0.05;
      alertSphereRef.current.material.color.setHex(0xff0000);
    }
  });

  return (
    <group>
      {/* Enemy Model - Corporate Agent */}
      <group ref={enemyRef} position={currentPosition}>
        <group>
          {/* Body in dark suit */}
          <mesh position={[0, 1, 0]} castShadow>
            <capsuleGeometry args={[0.4, 1.4]} />
            <meshStandardMaterial color="#2c2c2c" />
          </mesh>
          
          {/* Head */}
          <mesh position={[0, 1.9, 0]} castShadow>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial color="#d4a574" />
          </mesh>
          
          {/* Sunglasses */}
          <mesh position={[0, 1.95, 0.2]} castShadow>
            <boxGeometry args={[0.4, 0.15, 0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          
          {/* Earpiece */}
          <mesh position={[0.25, 1.9, 0]} castShadow>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          {/* Arms */}
          <mesh position={[-0.6, 1.2, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.8]} />
            <meshStandardMaterial color="#2c2c2c" />
          </mesh>
          <mesh position={[0.6, 1.2, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.8]} />
            <meshStandardMaterial color="#2c2c2c" />
          </mesh>
          
          {/* Legs */}
          <mesh position={[-0.2, 0.35, 0]} castShadow>
            <capsuleGeometry args={[0.15, 0.7]} />
            <meshStandardMaterial color="#2c2c2c" />
          </mesh>
          <mesh position={[0.2, 0.35, 0]} castShadow>
            <capsuleGeometry args={[0.15, 0.7]} />
            <meshStandardMaterial color="#2c2c2c" />
          </mesh>
        </group>

        {/* Enemy flashlight/vision cone */}
        <spotLight
          position={[0, 1.5, 0.5]}
          angle={Math.PI / 4}
          penumbra={0.5}
          intensity={isChasing ? 2 : 1}
          distance={15}
          color={isAlerted ? "#ff0000" : "#ffffff"}
          castShadow
        />

        {/* Alert indicator */}
        {isAlerted && (
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial 
              color="#ff0000" 
              transparent 
              opacity={0.8}
              emissive="#ff0000"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>

      {/* Detection Radius Visualization (for debugging/gameplay) */}
      <mesh ref={detectionSphereRef} position={currentPosition}>
        <sphereGeometry args={[detectionRadius]} />
        <meshBasicMaterial 
          color="#ffff00" 
          transparent 
          opacity={0.1}
          wireframe
        />
      </mesh>

      {/* Alert Radius Visualization */}
      <mesh ref={alertSphereRef} position={currentPosition}>
        <sphereGeometry args={[alertRadius]} />
        <meshBasicMaterial 
          color="#ff0000" 
          transparent 
          opacity={0.05}
          wireframe
        />
      </mesh>

      {/* Patrol Route Visualization */}
      <group>
        {patrolPoints.map((point, index) => (
          <mesh key={index} position={point}>
            <sphereGeometry args={[0.3]} />
            <meshBasicMaterial 
              color="#00ff41" 
              transparent 
              opacity={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
