import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useInventory } from "../lib/stores/useInventory";
import { useGameState } from "../lib/stores/useGameState";

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


export default function Gadgets() {
  const [subscribe, get] = useKeyboardControls<Controls>();
  const { position: playerPosition } = usePlayer();
  const { selectedGadget, setSelectedGadget, items, addItem } = useInventory();
  const { timeOfDay } = useGameState();

  // Drone state
  const droneRef = useRef<THREE.Group>(null);
  const [droneActive, setDroneActive] = useState(false);
  const [dronePosition, setDronePosition] = useState(new THREE.Vector3());
  const [droneTarget, setDroneTarget] = useState(new THREE.Vector3());

  // Camera gadget
  const [cameraActive, setCameraActive] = useState(false);
  const [photographsTaken, setPhotographsTaken] = useState(0);

  // Lockpick gadget
  const [lockpickActive, setLockpickActive] = useState(false);
  const [lockpickProgress, setLockpickProgress] = useState(0);

  // Handle gadget selection
  useEffect(() => {
    const unsubscribeGadget1 = subscribe(
      (state) => state.gadget1,
      (pressed) => {
        if (pressed && items.includes('drone')) {
          setSelectedGadget('drone');
          setDroneActive(!droneActive);
          console.log("Mini drone activated:", !droneActive);
        }
      }
    );

    const unsubscribeGadget2 = subscribe(
      (state) => state.gadget2,
      (pressed) => {
        if (pressed && items.includes('lockpick')) {
          setSelectedGadget('lockpick');
          setLockpickActive(true);
          console.log("Lockpick tools activated");
        }
      }
    );

    const unsubscribeGadget3 = subscribe(
      (state) => state.gadget3,
      (pressed) => {
        if (pressed && items.includes('camera')) {
          setSelectedGadget('camera');
          setCameraActive(true);
          takePhotograph();
          console.log("Hidden camera activated - photograph taken");
        }
      }
    );

    return () => {
      unsubscribeGadget1();
      unsubscribeGadget2();
      unsubscribeGadget3();
    };
  }, [subscribe, items, droneActive, selectedGadget, setSelectedGadget]);

  // Drone AI and movement
  useFrame((state, delta) => {
    if (droneActive && droneRef.current) {
      const playerPos = new THREE.Vector3(...playerPosition);
      
      // Drone follows player but maintains distance and height
      const idealPosition = playerPos.clone();
      idealPosition.add(new THREE.Vector3(3, 4, 3));
      
      // Smooth movement toward ideal position
      dronePosition.lerp(idealPosition, 0.05);
      droneRef.current.position.copy(dronePosition);
      
      // Rotating propellers effect
      droneRef.current.rotation.y += delta * 2;
      
      // Bobbing motion
      const time = state.clock.elapsedTime;
      droneRef.current.position.y += Math.sin(time * 3) * 0.1;

      // Scanning behavior
      const scanRadius = 15;
      const scanCenter = playerPos.clone();
      scanCenter.y += 5;
      
      // Visual scanning effect
      if (droneRef.current.children.length > 0) {
        const scanTime = time * 0.5;
        const scanX = Math.cos(scanTime) * scanRadius;
        const scanZ = Math.sin(scanTime) * scanRadius;
        droneTarget.set(scanCenter.x + scanX, scanCenter.y, scanCenter.z + scanZ);
      }
    }

    // Lockpick progress simulation
    if (lockpickActive && lockpickProgress < 100) {
      setLockpickProgress(prev => Math.min(prev + delta * 20, 100));
      
      if (lockpickProgress >= 100) {
        setLockpickActive(false);
        setLockpickProgress(0);
        console.log("Lock successfully picked!");
        // Here you would unlock a door or container
      }
    }
  });

  const takePhotograph = () => {
    if (cameraActive) {
      setPhotographsTaken(prev => prev + 1);
      setCameraActive(false);
      
      // Flash effect could be added here
      console.log(`Evidence photograph ${photographsTaken + 1} captured`);
      
      // Reset camera after use
      setTimeout(() => {
        setCameraActive(false);
      }, 500);
    }
  };

  return (
    <group>
      {/* Mini Reconnaissance Drone */}
      {droneActive && (
        <group ref={droneRef} position={dronePosition}>
          <group>
            {/* Main body */}
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.2, 0.8]} />
              <meshStandardMaterial color="#2c3e50" />
            </mesh>
            
            {/* Propellers */}
            <mesh position={[0.4, 0.1, 0.4]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05]} />
              <meshStandardMaterial color="#34495e" />
            </mesh>
            <mesh position={[-0.4, 0.1, 0.4]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05]} />
              <meshStandardMaterial color="#34495e" />
            </mesh>
            <mesh position={[0.4, 0.1, -0.4]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05]} />
              <meshStandardMaterial color="#34495e" />
            </mesh>
            <mesh position={[-0.4, 0.1, -0.4]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05]} />
              <meshStandardMaterial color="#34495e" />
            </mesh>

            {/* LED status light */}
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.05]} />
              <meshStandardMaterial 
                color="#00ff41" 
                emissive="#00ff41"
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>

          {/* Drone spotlight for reconnaissance */}
          <spotLight
            position={[0, -0.5, 0]}
            angle={Math.PI / 3}
            penumbra={0.5}
            intensity={0.8}
            distance={20}
            color="#ffffff"
            castShadow
          />

          {/* Scanning beam */}
          <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[3, 0.1, 10]} />
            <meshBasicMaterial 
              color="#00ff41" 
              transparent 
              opacity={0.2}
            />
          </mesh>
        </group>
      )}

      {/* Gadget Pickup Items scattered in world */}
      <group>
        {/* Drone pickup */}
        {!items.includes('drone') && (
          <mesh position={[5, 1, -10]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.3, 0.5]} />
            <meshStandardMaterial 
              color="#3498db"
              emissive="#3498db"
              emissiveIntensity={0.2}
            />
            {/* Interaction indicator */}
            <mesh position={[0, 1, 0]}>
              <ringGeometry args={[0.8, 1.0, 8]} />
              <meshBasicMaterial color="#00ff41" transparent opacity={0.5} />
            </mesh>
          </mesh>
        )}

        {/* Lockpick pickup */}
        {!items.includes('lockpick') && (
          <mesh position={[-8, 0.5, 5]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.1, 0.8]} />
            <meshStandardMaterial 
              color="#f39c12"
              emissive="#f39c12"
              emissiveIntensity={0.2}
            />
            {/* Interaction indicator */}
            <mesh position={[0, 1, 0]}>
              <ringGeometry args={[0.8, 1.0, 8]} />
              <meshBasicMaterial color="#00ff41" transparent opacity={0.5} />
            </mesh>
          </mesh>
        )}

        {/* Camera pickup */}
        {!items.includes('camera') && (
          <mesh position={[12, 0.8, -5]} castShadow receiveShadow>
            <boxGeometry args={[0.4, 0.3, 0.6]} />
            <meshStandardMaterial 
              color="#e74c3c"
              emissive="#e74c3c"
              emissiveIntensity={0.2}
            />
            {/* Interaction indicator */}
            <mesh position={[0, 1, 0]}>
              <ringGeometry args={[0.8, 1.0, 8]} />
              <meshBasicMaterial color="#00ff41" transparent opacity={0.5} />
            </mesh>
          </mesh>
        )}
      </group>

      {/* Visual Effects for Active Gadgets */}
      
      {/* Lockpick Progress Indicator */}
      {lockpickActive && (
        <mesh position={[...playerPosition].map((p, i) => i === 1 ? p + 2 : p) as [number, number, number]}>
          <ringGeometry args={[1.5, 1.8, 32, 1, 0, (lockpickProgress / 100) * Math.PI * 2]} />
          <meshBasicMaterial color="#f39c12" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Camera Flash Effect */}
      {cameraActive && (
        <mesh position={playerPosition}>
          <sphereGeometry args={[10]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Gadget Status Lights */}
      {selectedGadget === 'drone' && droneActive && (
        <mesh position={[...playerPosition].map((p, i) => i === 1 ? p + 3 : p) as [number, number, number]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial 
            color="#3498db" 
            emissive="#3498db"
            emissiveIntensity={1.0}
          />
        </mesh>
      )}
    </group>
  );
}

// Gadget interaction component for when player is near items
export function GadgetPickupSystem() {
  const { position: playerPosition } = usePlayer();
  const { addItem, items } = useInventory();
  const [subscribe] = useKeyboardControls<Controls>();

  useEffect(() => {
    const unsubscribeInteract = subscribe(
      (state) => state.interact,
      (pressed) => {
        if (pressed) {
          const playerPos = new THREE.Vector3(...playerPosition);
          
          // Check for nearby gadgets and pick them up
          const gadgetPositions = [
            { pos: new THREE.Vector3(5, 1, -10), item: 'drone', name: 'Mini Reconnaissance Drone' },
            { pos: new THREE.Vector3(-8, 0.5, 5), item: 'lockpick', name: 'Professional Lockpick Set' },
            { pos: new THREE.Vector3(12, 0.8, -5), item: 'camera', name: 'Covert Camera System' }
          ];

          gadgetPositions.forEach(gadget => {
            const distance = playerPos.distanceTo(gadget.pos);
            if (distance < 2 && !items.includes(gadget.item)) {
              addItem(gadget.item);
              console.log(`Acquired: ${gadget.name}`);
              // You could add a UI notification here
            }
          });
        }
      }
    );

    return () => unsubscribeInteract();
  }, [subscribe, playerPosition, addItem, items]);

  return null;
}
