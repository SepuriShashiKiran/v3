import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useGameState } from "./lib/stores/useGameState";
import { useAudio } from "./lib/stores/useAudio";
import Game from "./components/Game";
import MainMenu from "./components/MainMenu";
import MissionSelector from "./components/MissionSelector";
import GameUI from "./components/GameUI";
import Level1Manager from "./components/Level1Manager";
import "@fontsource/inter";

// Define control keys for the spy thriller game
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

const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.run, keys: ["ShiftLeft", "ShiftRight"] },
  { name: Controls.crouch, keys: ["KeyC"] },
  { name: Controls.interact, keys: ["KeyE"] },
  { name: Controls.gadget1, keys: ["Digit1"] },
  { name: Controls.gadget2, keys: ["Digit2"] },
  { name: Controls.gadget3, keys: ["Digit3"] },
  { name: Controls.pause, keys: ["Escape"] },
  { name: Controls.hack, keys: ["KeyF"] },
];

function App() {
  const { gamePhase } = useGameState();
  const { toggleMute } = useAudio();

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstClick = () => {
      console.log("First user interaction - initializing audio");
      document.removeEventListener('click', handleFirstClick);
    };
    
    document.addEventListener('click', handleFirstClick);
    return () => document.removeEventListener('click', handleFirstClick);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        {/* Main Menu Phase */}
        {gamePhase === 'menu' && <MainMenu />}

        {/* Mission Selection Phase */}
        {gamePhase === 'mission_select' && <MissionSelector />}

        {/* Game Phase */}
        {(gamePhase === 'playing' || gamePhase === 'paused') && (
          <>
            <Canvas
              shadows
              camera={{
                position: [0, 5, 10],
                fov: 75,
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "high-performance"
              }}
              style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
            >
              <Suspense fallback={null}>
                <Game />
              </Suspense>
            </Canvas>
            <GameUI />
            <Level1Manager />
          </>
        )}

        {/* Audio Control - Global */}
        <button
          onClick={toggleMute}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            background: 'rgba(0, 255, 65, 0.1)',
            border: '1px solid #00ff41',
            color: '#00ff41',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace'
          }}
        >
          AUDIO
        </button>
      </KeyboardControls>
    </div>
  );
}

export default App;
