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
    completed: false
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
      setDialogText("Found it! Hyderabad Liberation Day: September 17, 1948. The numbers could be 17091948!");
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
      setShowPhoneCall(true);
      playSuccess();
      addExperience(150);
      
      setTimeout(() => {
        setShowPhoneCall(false);
        setDialogText("Riya: 'Great work, Ayaan! I've unlocked the security protocols. The door should open now with the Liberation Day code!'");
        setShowDialog(true);
        
        if (currentObjectiveIndex === 2) {
          setCurrentObjectiveIndex(3);
        }
      }, 3000);
    }
  };

  // Handle combination lock
  const handleCombinationLock = () => {
    if (hasItem("liberation_date") && level1State.hackedLaptop) {
      setLevel1State(prev => ({ ...prev, unlockedDoor: true }));
      setDialogText("The lock clicks open! You hear the door mechanism unlocking. Freedom awaits!");
      setShowDialog(true);
      playSuccess();
      addExperience(200);
      
      if (currentObjectiveIndex === 3) {
        setCurrentObjectiveIndex(4);
        completeLevel1();
      }
    } else if (!hasItem("liberation_date")) {
      setDialogText("You need the Liberation Day numbers first. Check the newspapers!");
      setShowDialog(true);
    } else if (!level1State.hackedLaptop) {
      setDialogText("The lock is still connected to security. Hack the laptop with Riya's help first!");
      setShowDialog(true);
    }
  };

  // Complete Level 1
  const completeLevel1 = () => {
    setLevel1State(prev => ({ ...prev, completed: true }));
    setMissionProgress(100);
    addExperience(500);
    
    setTimeout(() => {
      setDialogText("LEVEL 1 COMPLETE! You've escaped the locked room. Level 2: PARKOUR ESCAPE is now unlocked!");
      setShowDialog(true);
      
      setTimeout(() => {
        setGamePhase('mission_select');
      }, 3000);
    }, 2000);
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
              <div className="text-white text-sm mb-4">{dialogText}</div>
              <button 
                className="spy-button w-full"
                onClick={() => setShowDialog(false)}
              >
                CONTINUE
              </button>
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
                <div className="animate-pulse text-green-400">●●●</div>
              </div>
              <div className="text-white text-sm text-center">
                "Ayaan! I can see you've accessed the laptop. I'm hacking into their security system now..."
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
              ✓ Room Exploration
            </div>
            <div className={level1State.readNewspapers ? "text-green-400" : "text-gray-400"}>
              ✓ Liberation Day Clue
            </div>
            <div className={level1State.hackedLaptop ? "text-green-400" : "text-gray-400"}>
              ✓ Laptop Hacked
            </div>
            <div className={level1State.unlockedDoor ? "text-green-400" : "text-gray-400"}>
              ✓ Door Unlocked
            </div>
            <div className={level1State.completed ? "text-green-400" : "text-gray-400"}>
              ✓ Escape Complete
            </div>
          </div>
        </div>
      </div>
    </>
  );
}