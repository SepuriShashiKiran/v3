import { useState, useEffect } from "react";
import { usePlayer } from "../lib/stores/usePlayer";
import { useGameState } from "../lib/stores/useGameState";
import { useInventory } from "../lib/stores/useInventory";
import { useKeyboardControls } from "@react-three/drei";
import HackingMinigame from "./HackingMinigame";

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

export default function GameUI() {
  const { health, stealthMode, position } = usePlayer();
  const { timeOfDay, currentObjective, gamePhase, setGamePhase } = useGameState();
  const { items, selectedGadget } = useInventory();
  const [subscribe] = useKeyboardControls<Controls>();
  
  const [showObjectives, setShowObjectives] = useState(true);
  const [showHackingGame, setShowHackingGame] = useState(false);
  const [missionTimer, setMissionTimer] = useState(0);
  const [detectionLevel, setDetectionLevel] = useState(0);

  // Format time of day for display
  const formatTime = (time: number) => {
    const hours = Math.floor(time * 24);
    const minutes = Math.floor((time * 24 * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Update mission timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (gamePhase === 'playing') {
        setMissionTimer(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gamePhase]);

  // Handle pause key
  useEffect(() => {
    const unsubscribePause = subscribe(
      (state) => state.pause,
      (pressed) => {
        if (pressed) {
          setGamePhase(gamePhase === 'playing' ? 'paused' : 'playing');
        }
      }
    );

    const unsubscribeHack = subscribe(
      (state) => state.hack,
      (pressed) => {
        if (pressed) {
          setShowHackingGame(true);
        }
      }
    );

    return () => {
      unsubscribePause();
      unsubscribeHack();
    };
  }, [subscribe, gamePhase, setGamePhase]);

  const formatMissionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* Mini-map */}
        <div className="minimap spy-panel pointer-events-auto">
          <div className="p-2">
            <div className="text-xs spy-text mb-1">TACTICAL OVERVIEW</div>
            <div className="relative w-32 h-32 border border-green-400 rounded-full bg-black bg-opacity-80">
              {/* Player position indicator */}
              <div 
                className="absolute w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1 -translate-y-1"
                style={{
                  left: '50%',
                  top: '50%'
                }}
              />
              {/* Objective markers */}
              <div className="absolute w-1 h-1 bg-green-400 rounded-full animate-pulse" 
                   style={{ left: '70%', top: '30%' }} />
              <div className="absolute w-1 h-1 bg-red-400 rounded-full" 
                   style={{ left: '40%', top: '60%' }} />
            </div>
          </div>
        </div>

        {/* Mission Status */}
        <div className="spy-panel pointer-events-auto max-w-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="spy-text font-bold text-sm">THE HYDERABAD CHRONICLES</h3>
              <div className="text-xs text-blue-400">{formatMissionTime(missionTimer)}</div>
            </div>
            
            {/* Current Objective */}
            <div className="mb-3">
              <div className="text-xs text-green-400 mb-1">CURRENT OBJECTIVE:</div>
              <div className="text-sm text-white">
                {currentObjective || "Examine the room for clues and hidden items"}
              </div>
            </div>

            {/* Environmental Status */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-blue-400">TIME:</span> {formatTime(timeOfDay)}
              </div>
              <div>
                <span className="text-green-400">MODE:</span> 
                <span className={stealthMode ? "text-green-400" : "text-yellow-400"}>
                  {stealthMode ? " STEALTH" : " EXPOSED"}
                </span>
              </div>
            </div>

            {/* Detection Level */}
            <div className="mt-2">
              <div className="text-xs text-yellow-400 mb-1">THREAT LEVEL:</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    detectionLevel < 30 ? 'bg-green-400' : 
                    detectionLevel < 70 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${detectionLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        {/* Health and Status */}
        <div className="spy-panel pointer-events-auto">
          <div className="p-3">
            <div className="text-xs text-green-400 mb-1">AGENT STATUS</div>
            
            {/* Health Bar */}
            <div className="mb-2">
              <div className="text-xs text-white mb-1">VITALS: {health}%</div>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    health > 75 ? 'bg-green-400' : 
                    health > 25 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>

            {/* Status Effects */}
            <div className="flex gap-2 text-xs">
              {stealthMode && (
                <span className="px-2 py-1 bg-green-900 text-green-400 rounded">STEALTH</span>
              )}
              {timeOfDay < 0.3 && (
                <span className="px-2 py-1 bg-blue-900 text-blue-400 rounded">NIGHT OPS</span>
              )}
            </div>
          </div>
        </div>

        {/* Inventory/Gadgets */}
        <div className="spy-panel pointer-events-auto">
          <div className="p-3">
            <div className="text-xs text-green-400 mb-2">SPY GADGETS</div>
            <div className="flex gap-2">
              {[
                { key: '1', name: 'DRONE', icon: '🚁', available: items.includes('drone') },
                { key: '2', name: 'LOCKPICK', icon: '🔓', available: items.includes('lockpick') },
                { key: '3', name: 'CAMERA', icon: '📷', available: items.includes('camera') }
              ].map((gadget) => (
                <div 
                  key={gadget.key}
                  className={`inventory-slot ${
                    selectedGadget === gadget.name.toLowerCase() ? 'border-green-400 bg-green-900' : ''
                  } ${!gadget.available ? 'opacity-30' : ''}`}
                >
                  <div className="text-lg">{gadget.icon}</div>
                  <div className="text-xs text-green-400 absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    {gadget.key}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="spy-panel pointer-events-auto">
          <div className="px-4 py-2 text-xs text-green-400">
            <div className="grid grid-cols-4 gap-4">
              <span>WASD: MOVE</span>
              <span>SHIFT: RUN</span>
              <span>C: CROUCH</span>
              <span>E: INTERACT</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-1">
              <span>F: HACK</span>
              <span>ESC: MENU</span>
              <span>ESC: PAUSE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pause Menu Overlay */}
      {gamePhase === 'paused' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto z-60">
          <div className="spy-panel">
            <div className="p-8 text-center">
              <h2 className="spy-text text-2xl mb-6">MISSION PAUSED</h2>
              <div className="space-y-4">
                <button 
                  className="spy-button w-full"
                  onClick={() => setGamePhase('playing')}
                >
                  RESUME OPERATION
                </button>
                <button 
                  className="spy-button w-full"
                  onClick={() => setGamePhase('menu')}
                >
                  ABORT MISSION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hacking Minigame */}
      {showHackingGame && (
        <HackingMinigame onClose={() => setShowHackingGame(false)} />
      )}

      {/* Mission Critical Alerts */}
      {detectionLevel > 80 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-70">
          <div className="spy-panel border-red-400 mission-critical">
            <div className="p-4 text-center">
              <div className="text-red-400 text-xl font-bold mb-2">SECURITY ALERT</div>
              <div className="text-white text-sm">Someone's coming! Stay quiet and hidden!</div>
            </div>
          </div>
        </div>
      )}

      {/* Level 1 specific tutorial overlay */}
      {gamePhase === 'playing' && missionTimer < 10 && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-60">
          <div className="spy-panel border-green-400">
            <div className="p-4 text-center max-w-md">
              <div className="text-green-400 text-lg font-bold mb-2">LEVEL 1: ESCAPE ROOM</div>
              <div className="text-white text-sm mb-2">
                You're locked in a room in Banjara Hills. Find clues, solve puzzles, and escape!
              </div>
              <div className="text-xs text-gray-400">
                Look for interactive objects (they glow green when you're near them)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
