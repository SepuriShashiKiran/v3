import { useRef, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../lib/stores/useGameState";
import InteractiveObject from "./InteractiveObject";

export default function Environment() {
  const { timeOfDay } = useGameState();
  
  // Load available textures
  const asphaltTexture = useTexture("/textures/asphalt.png");
  const grassTexture = useTexture("/textures/grass.png");
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Pre-calculate random positions for background elements
  const buildingPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 15; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 200,
        height: 10 + Math.random() * 30,
        width: 5 + Math.random() * 10,
        depth: 5 + Math.random() * 10
      });
    }
    return positions;
  }, []);

  const containerPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 8; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 100,
        z: (Math.random() - 0.5) * 100,
        rotation: Math.random() * Math.PI * 2
      });
    }
    return positions;
  }, []);

  // Dynamic lighting color based on time of day
  const skyColor = useMemo(() => {
    const nightColor = new THREE.Color(0x0a0a2e);
    const dayColor = new THREE.Color(0x87ceeb);
    return new THREE.Color().lerpColors(nightColor, dayColor, timeOfDay);
  }, [timeOfDay]);

  return (
    <group>
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial 
          map={asphaltTexture} 
          color="#2c3e50"
        />
      </mesh>

      {/* Banjara Hills - Locked Room Area */}
      <group position={[0, 0, -30]}>
        {/* Main Building (Ayaan's Prison) - Hollow for interior */}
        <group>
          {/* Exterior walls */}
          <mesh position={[-12, 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 12, 15]} />
            <meshStandardMaterial color="#d4a574" />
          </mesh>
          <mesh position={[12, 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 12, 15]} />
            <meshStandardMaterial color="#d4a574" />
          </mesh>
          <mesh position={[0, 6, -7]} castShadow receiveShadow>
            <boxGeometry args={[25, 12, 1]} />
            <meshStandardMaterial color="#d4a574" />
          </mesh>
          <mesh position={[0, 6, 7]} castShadow receiveShadow>
            <boxGeometry args={[25, 12, 1]} />
            <meshStandardMaterial color="#d4a574" />
          </mesh>
          
          {/* Floor */}
          <mesh position={[0, 0, 0]} receiveShadow>
            <boxGeometry args={[24, 0.2, 14]} />
            <meshStandardMaterial color="#8b6f47" />
          </mesh>
          
          {/* Ceiling */}
          <mesh position={[0, 12, 0]} castShadow>
            <boxGeometry args={[24, 0.2, 14]} />
            <meshStandardMaterial color="#8b6f47" />
          </mesh>
          
          {/* Traditional Roof */}
          <mesh position={[0, 12.5, 0]} castShadow>
            <boxGeometry args={[26, 1, 16]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        </group>

        {/* === LEVEL 1 INTERACTIVE OBJECTS === */}
        
        {/* Cricket Bat - Local Hyderabad item */}
        <InteractiveObject
          position={[-8, 1, -3]}
          size={[0.3, 2, 0.1]}
          color="#8b4513"
          name="Cricket Bat"
          description="A worn cricket bat - could be useful for breaking something"
          type="pickup"
        />
        
        {/* Old Newspapers with Hyderabad Liberation Day clues */}
        <InteractiveObject
          position={[8, 1, 2]}
          size={[1.5, 0.1, 1]}
          color="#f5deb3"
          name="Old Newspapers"
          description="Hyderabad newspapers from September 17, 1948 - Liberation Day!"
          type="examine"
          onInteract={() => {
            // Connect to Level1Manager
            if ((window as any).level1Handlers) {
              (window as any).level1Handlers.handleNewspaperRead();
            }
          }}
        />
        
        {/* Laptop for hacking with Riya's help */}
        <InteractiveObject
          position={[0, 2, 5]}
          size={[1.2, 0.1, 0.8]}
          color="#2f4f4f"
          name="Old Laptop"
          description="Vintage laptop - press F to hack with Riya's help"
          type="hack"
          onInteract={() => {
            // Connect to Level1Manager
            if ((window as any).level1Handlers) {
              (window as any).level1Handlers.handleLaptopHacked();
            }
          }}
        >
          {/* Laptop screen */}
          <mesh position={[0, 0.3, -0.3]}>
            <boxGeometry args={[1.2, 0.8, 0.1]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </InteractiveObject>
        
        {/* Combination Lock - Main puzzle */}
        <InteractiveObject
          position={[11, 6, 0]}
          size={[0.5, 1, 0.3]}
          color="#c0c0c0"
          name="Combination Lock"
          description="Electronic lock - needs numbers from Liberation Day"
          type="unlock"
          requiredItem="liberation_date"
          onInteract={() => {
            // Connect to Level1Manager
            if ((window as any).level1Handlers) {
              (window as any).level1Handlers.handleCombinationLock();
            }
          }}
        >
          {/* Lock display */}
          <mesh position={[0.3, 0, 0]}>
            <boxGeometry args={[0.1, 0.5, 0.5]} />
            <meshStandardMaterial 
              color="#000000" 
              emissive="#ff0000" 
              emissiveIntensity={0.2} 
            />
          </mesh>
        </InteractiveObject>
        
        {/* Hyderabadi Tea Glass - Local flavor */}
        <InteractiveObject
          position={[-5, 1, 4]}
          size={[0.2, 0.3, 0.2]}
          color="#d2691e"
          name="Irani Chai Glass"
          description="Traditional Hyderabadi tea glass - might hide something"
          type="examine"
        />
        
        {/* Pearls - Hyderabad's famous pearls */}
        <InteractiveObject
          position={[3, 1, -5]}
          size={[0.3, 0.1, 0.3]}
          color="#f8f8ff"
          name="Pearl Necklace"
          description="Beautiful Hyderabadi pearls - a clue perhaps?"
          type="pickup"
        />
        
        {/* Biryani Box - Local food item */}
        <InteractiveObject
          position={[-3, 1, 6]}
          size={[1, 0.3, 1]}
          color="#ff6347"
          name="Biryani Box"
          description="Paradise Biryani takeaway box - check for hidden notes"
          type="examine"
        />
        
        {/* Window (locked) */}
        <mesh position={[-11, 8, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 2, 2]} />
          <meshStandardMaterial color="#4169e1" transparent opacity={0.3} />
        </mesh>
        
        {/* Door (initially locked) */}
        <mesh position={[11.5, 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 6, 2]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>

        {/* Neighboring Houses */}
        <mesh position={[-20, 4, 5]} castShadow receiveShadow>
          <boxGeometry args={[10, 8, 10]} />
          <meshStandardMaterial color="#deb887" />
        </mesh>
        
        <mesh position={[20, 5, -5]} castShadow receiveShadow>
          <boxGeometry args={[12, 10, 8]} />
          <meshStandardMaterial color="#cd853f" />
        </mesh>
      </group>

      {/* Charminar Area - Parkour Section */}
      <group position={[40, 0, 0]}>
        {[...Array(5)].map((_, i) => (
          <mesh 
            key={i}
            position={[i * 8 - 16, 8 + i * 2, 0]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[6, 16, 6]} />
            <meshStandardMaterial color="#daa520" />
          </mesh>
        ))}
        
        {/* Traditional wooden platforms */}
        {[...Array(4)].map((_, i) => (
          <mesh 
            key={`platform-${i}`}
            position={[i * 8 - 12, 16 + i * 2, 0]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[3, 0.5, 3]} />
            <meshStandardMaterial map={woodTexture} color="#8b4513" />
          </mesh>
        ))}
      </group>

      {/* Alleyway Network - Stealth Sections */}
      <group position={[-40, 0, 20]}>
        {/* Alley walls */}
        <mesh position={[0, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 8, 40]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[8, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 8, 40]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {/* Dumpsters and cover objects */}
        {containerPositions.slice(0, 4).map((pos, i) => (
          <mesh 
            key={`dumpster-${i}`}
            position={[pos.x * 0.1 + 4, 1, pos.z * 0.3]} 
            rotation={[0, pos.rotation, 0]}
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[2, 2, 1]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
        ))}
      </group>

      {/* Hi-Tech City - Fake Startup Building */}
      <group position={[0, 0, 50]}>
        {/* Modern Tech Building */}
        <mesh position={[0, 8, 0]} castShadow receiveShadow>
          <boxGeometry args={[20, 16, 12]} />
          <meshStandardMaterial color="#2f4f4f" />
        </mesh>
        
        {/* Glass facade */}
        <mesh position={[0, 8, 6.1]} receiveShadow>
          <boxGeometry args={[19, 15, 0.2]} />
          <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* City Skyline Background */}
      {buildingPositions.map((building, i) => (
        <mesh 
          key={`building-${i}`}
          position={[building.x, building.height / 2, building.z]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[building.width, building.height, building.depth]} />
          <meshStandardMaterial 
            color={timeOfDay < 0.3 ? "#1a1a2e" : "#34495e"}
            emissive={timeOfDay < 0.3 ? "#ff6b35" : "#000000"}
            emissiveIntensity={timeOfDay < 0.3 ? 0.1 : 0}
          />
        </mesh>
      ))}

      {/* Interactive Cover Objects */}
      <group>
        {/* Spy vehicle */}
        <mesh position={[15, 1, 25]} castShadow receiveShadow>
          <boxGeometry args={[4, 2, 8]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {/* Information kiosk */}
        <mesh position={[-10, 1.5, 15]} castShadow receiveShadow>
          <boxGeometry args={[1, 3, 1]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        
        {/* Shipping containers */}
        {containerPositions.map((pos, i) => (
          <mesh 
            key={`container-${i}`}
            position={[pos.x, 1.5, pos.z]} 
            rotation={[0, pos.rotation, 0]}
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[8, 3, 3]} />
            <meshStandardMaterial color="#e67e22" />
          </mesh>
        ))}
      </group>

      {/* Atmospheric Particles for Night Scenes */}
      {timeOfDay < 0.5 && (
        <group>
          {[...Array(20)].map((_, i) => (
            <mesh 
              key={`particle-${i}`}
              position={[
                (Math.random() - 0.5) * 100,
                Math.random() * 20 + 5,
                (Math.random() - 0.5) * 100
              ]}
            >
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial 
                color="#ff6b35" 
                transparent 
                opacity={0.3}
                emissive="#ff6b35"
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Dynamic Sky Dome */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial 
          color={skyColor}
          side={THREE.BackSide}
          fog={false}
        />
      </mesh>
    </group>
  );
}
