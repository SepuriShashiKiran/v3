import { useState, useEffect } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

export default function MainMenu() {
  const { setGamePhase } = useGameState();
  const { toggleMute } = useAudio();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Show intro animation for 3 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const startGame = () => {
    setGamePhase('mission_select');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-orange-400 text-xs font-mono animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          >
            {['हैदराबाद', 'బుర్యాణి', 'चारमीनार', 'హైదరాబాద్'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      {showIntro ? (
        // Intro Animation
        <div className="text-center">
          <div className="spy-text text-4xl mb-8 animate-pulse">
            CLASSIFIED
          </div>
          <div className="spy-text text-lg">
            Initializing secure connection...
          </div>
          <div className="mt-4">
            <div className="w-64 bg-gray-700 rounded-full h-2">
              <div className="bg-orange-400 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      ) : (
        // Main Menu
        <div className="spy-panel max-w-md w-full mx-4">
          <div className="p-8 text-center">
            {/* Game Title */}
            <div className="mb-8">
              <h1 className="spy-text text-3xl font-bold mb-2">
                THE HYDERABAD CHRONICLES
              </h1>
              <div className="text-orange-400 text-sm font-mono">
                :: ESCAPE & UNCOVER ::
              </div>
            </div>

            {/* Character Introduction */}
            <div className="mb-8 p-4 border border-orange-400 bg-black bg-opacity-50">
              <div className="text-orange-400 text-xs mb-2">STUDENT PROFILE</div>
              <div className="text-white text-sm text-left">
                <strong className="text-orange-400">Name:</strong> Ayaan Malik<br />
                <strong className="text-orange-400">Age:</strong> 17<br />
                <strong className="text-orange-400">School:</strong> Hyderabad High<br />
                <strong className="text-orange-400">Status:</strong> CAPTURED
              </div>
              <div className="text-gray-400 text-xs mt-2 text-left">
                Student journalist who discovered corruption in his city. 
                Captured by Raghav "The Tycoon" Varma's goons after uncovering 
                evidence of a criminal empire. Must escape and save his friend Riya.
              </div>
            </div>

            {/* Menu Options */}
            <div className="space-y-4">
              <button 
                className="spy-button w-full text-lg py-4"
                onClick={startGame}
              >
                BEGIN OPERATION
              </button>
              
              <button 
                className="spy-button w-full opacity-50 cursor-not-allowed"
                disabled
              >
                LOAD SAVE [LOCKED]
              </button>

              <button 
                className="spy-button w-full"
                onClick={() => {
                  // Show settings or instructions
                  alert('MISSION BRIEFING:\n\n• Use WASD to move\n• SHIFT to run\n• C to crouch for stealth\n• E to interact\n• F to hack systems\n• 1-3 to use spy gadgets\n\nObjective: Infiltrate enemy facilities, gather intelligence, and expose the conspiracy while avoiding detection.');
                }}
              >
                MISSION BRIEFING
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-xs text-gray-400">
              <div className="mb-2">Mission Critical - Eyes Only</div>
              <div className="text-orange-400">
                Set in Beautiful Hyderabad • Local Culture • Corruption Investigation
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version Info */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-600 font-mono">
        v1.0.0 - CLASSIFIED BUILD
      </div>

      {/* Audio Toggle */}
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 spy-button px-3 py-1 text-xs"
      >
        AUDIO
      </button>
    </div>
  );
}
