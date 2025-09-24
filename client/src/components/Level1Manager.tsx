import { useEffect, useState } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { useInventory } from "../lib/stores/useInventory";
import { usePlayer } from "../lib/stores/usePlayer";
import { useAudio } from "../lib/stores/useAudio";

interface Level1State {
  foundCricketBat: boolean;
  readNewspapers: boolean;
  hackedLaptop: boolean;
  foundLiberationDate: boolean;
  unlockedDoor: boolean;
  completed: boolean;
  showHints: boolean;
  hintsUsed: number;
}

export default function Level1Manager() {
  const { currentObjective, setCurrentObjective, setGamePhase, setMissionProgress } = useGameState();
  const { hasItem, addItem } = useInventory();
  const { addExperience } = usePlayer();
  const { playSuccess } = useAudio();
  
  const [level1State, setLevel1State] = useState<Level1State>({
    foundCricketBat: false,
    readNewspapers: false,
    hackedLaptop: false,
    foundLiberationDate: false,
    unlockedDoor: false,
    completed: false,
    showHints: false,
    hintsUsed: 0
  });

  const objectives = [
    "Examine the room for clues and hidden items",
    "Find numbers related to Hyderabad Liberation Day", 
    "Hack the laptop with Riya's help via phone",
    "Unlock the combination lock system",
    "Escape from the building"
  ];

  const [currentObjectiveIndex, setCurrentObjectiveIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogText, setDialogText] = useState("");
  const [showPhoneCall, setShowPhoneCall] = useState(false);

  // Hint system for Level 1
  const hints = [
    "Look around the room carefully. Old newspapers might contain important dates.",
    "The laptop needs to be hacked with Riya's help. Press F near it to start hacking.",
    "Hyderabad Liberation Day happened on September 17, 1948. Try using these numbers: 17091948",
    "The combination lock needs both the Liberation Day code AND the laptop to be hacked first.",
    "Check every corner of the room. Some items might be hidden behind furniture."
  ];

  const showHint = () => {
    if (level1State.hintsUsed < hints.length) {
      setDialogText(`HINT: ${hints[level1State.hintsUsed]}`);
      setShowDialog(true);
      setLevel1State(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    } else {
      setDialogText("No more hints available. You've got this, Ayaan!");
      setShowDialog(true);
    }
  };

  // Update current objective based on progress
  useEffect(() => {
    if (currentObjectiveIndex < objectives.length) {
      setCurrentObjective(objectives[currentObjectiveIndex]);
    }
  }, [currentObjectiveIndex, setCurrentObjective]);

  // Progress tracking
  useEffect(() => {
    const progress = (currentObjectiveIndex / objectives.length) * 100;
    setMissionProgress(progress);
  }, [currentObjectiveIndex, setMissionProgress]);

  // Handle newspaper interaction
  const handleNewspaperRead = () => {
    if (!level1State.readNewspapers) {
      setLevel1State(prev => ({ ...prev, readNewspapers: true, foundLiberationDate: true }));
      addItem("liberation_date");
      setDialogText("Found it! These old newspapers mention Hyderabad Liberation Day: September 17, 1948. The date could be important - maybe 17091948?");
      setShowDialog(true);
      playSuccess();
      addExperience(100);
      
      if (currentObjectiveIndex === 1) {
        setCurrentObjectiveIndex(2);
      }
    }
  };

  // Handle laptop hacking
  const handleLaptopHacked = () => {
    if (!level1State.hackedLaptop) {
      setLevel1State(prev => ({ ...prev, hackedLaptop: true }));
      // Show hacking minigame first, then phone call
      setDialogText("Connecting to Riya... Initiating hack sequence...");
      setShowDialog(true);
      playSuccess();
      addExperience(150);
      
      setTimeout(() => {
        setShowPhoneCall(true);
      }, 1500);
      
      setTimeout(() => {
        setShowPhoneCall(false);
        setDialogText("Riya: 'Perfect! I've disabled the security system remotely. Now you can use the Liberation Day code on the lock!'");
        setShowDialog(true);
        
        if (currentObjectiveIndex === 2) {
          setCurrentObjectiveIndex(3);
        }
      }, 4000);
    }
  };

  // Handle combination lock
  const handleCombinationLock = () => {
    if (hasItem("liberation_date") && level1State.hackedLaptop) {
      setLevel1State(prev => ({ ...prev, unlockedDoor: true }));
      setDialogText("*CLICK* The electronic lock disengages! The door swings open with a soft creak. You can see the corridor beyond - freedom at last!");
      setShowDialog(true);
      playSuccess();
      addExperience(200);
      
      if (currentObjectiveIndex === 3) {
        setCurrentObjectiveIndex(4);
        completeLevel1();
      }
    } else if (!hasItem("liberation_date")) {
      setDialogText("The lock's display shows: 'CODE REQUIRED'. You need to find the Liberation Day date first. Maybe check those old newspapers?");
      setShowDialog(true);
    } else if (!level1State.hackedLaptop) {
      setDialogText("The lock shows 'SECURITY ACTIVE'. The system is still online. You need Riya to hack the security first!");
      setShowDialog(true);
    }
  };

  // Complete Level 1
  const completeLevel1 = () => {
    setLevel1State(prev => ({ ...prev, completed: true }));
    setMissionProgress(100);
    addExperience(500);
    
    setTimeout(() => {
      setDialogText("🎉 LEVEL 1 COMPLETE! 🎉\n\nYou've successfully escaped from the locked room! Your investigative skills and Riya's hacking expertise make a great team.\n\nLevel 2: PARKOUR ESCAPE is now available!");
      setShowDialog(true);
      
      setTimeout(() => {
        setGamePhase('mission_select');
      }, 4000);
    }, 1500);
  };

  // Auto-advance first objective when player picks up items
  useEffect(() => {
    if (currentObjectiveIndex === 0 && hasItem("cricket_bat")) {
      setCurrentObjectiveIndex(1);
    }
  }, [hasItem, currentObjectiveIndex]);

  // Set up global interaction handlers
  useEffect(() => {
    // Make these functions available globally for InteractiveObject components
    (window as any).level1Handlers = {
      handleNewspaperRead,
      handleLaptopHacked,
      handleCombinationLock
    };

    return () => {
      delete (window as any).level1Handlers;
    };
  }, [level1State, hasItem]);

  return (
    <>
      {/* Dialog Box */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="spy-panel max-w-lg">
            <div className="p-6">
              <div className="text-green-400 text-lg font-bold mb-4">AYAAN'S LOG</div>
              <div className="text-white text-sm mb-4 whitespace-pre-line">{dialogText}</div>
              <div className="flex gap-2">
                <button 
                  className="spy-button flex-1"
                  onClick={() => setShowDialog(false)}
                >
                  CONTINUE
                </button>
                {!level1State.completed && level1State.hintsUsed < hints.length && (
                  <button 
                    className="spy-button border-yellow-400 text-yellow-400"
                    onClick={showHint}
                  >
                    HINT ({level1State.hintsUsed}/{hints.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Call with Riya */}
      {showPhoneCall && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="spy-panel border-green-400 max-w-lg">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="text-green-400 text-xl font-bold mb-2">📱 CALLING RIYA...</div>
                <div className="animate-pulse text-green-400 text-lg">●●● CONNECTING ●●●</div>
              </div>
              <div className="text-white text-sm text-center">
                <div className="mb-2">"Ayaan! I can see you've accessed the laptop."</div>
                <div className="text-green-400">"Initiating remote hack... bypassing firewalls... almost there..."</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level 1 Progress Indicator */}
      <div className="fixed top-20 right-4 spy-panel pointer-events-none">
        <div className="p-3">
          <div className="text-xs text-green-400 mb-2">LEVEL 1 PROGRESS</div>
          <div className="space-y-1 text-xs">
            <div className={level1State.foundCricketBat ? "text-green-400" : "text-gray-400"}>
              {level1State.foundCricketBat ? "✓" : "○"} Room Exploration
            </div>
            <div className={level1State.readNewspapers ? "text-green-400" : "text-gray-400"}>
              {level1State.readNewspapers ? "✓" : "○"} Liberation Day Clue
            </div>
            <div className={level1State.hackedLaptop ? "text-green-400" : "text-gray-400"}>
              {level1State.hackedLaptop ? "✓" : "○"} Laptop Hacked
            </div>
            <div className={level1State.unlockedDoor ? "text-green-400" : "text-gray-400"}>
              {level1State.unlockedDoor ? "✓" : "○"} Door Unlocked
            </div>
            <div className={level1State.completed ? "text-green-400" : "text-gray-400"}>
              {level1State.completed ? "✓" : "○"} Escape Complete
            </div>
          </div>
          {!level1State.completed && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-xs text-yellow-400">
                Hints Available: {hints.length - level1State.hintsUsed}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}