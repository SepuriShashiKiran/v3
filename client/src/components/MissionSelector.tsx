import { useState } from "react";
import { useGameState } from "../lib/stores/useGameState";

interface Mission {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  location: string;
  objectives: string[];
  estimatedTime: string;
  unlocked: boolean;
}

export default function MissionSelector() {
  const { setGamePhase, setCurrentObjective } = useGameState();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  const missions: Mission[] = [
    {
      id: 'locked_room',
      name: 'THE LOCKED ROOM',
      description: 'Ayaan wakes up in a locked room in Banjara Hills. Solve puzzles using local items like cricket bats and old newspapers to escape.',
      difficulty: 'Easy',
      location: 'Banjara Hills - Abandoned Building',
      objectives: [
        'Examine the room for clues and hidden items',
        'Find numbers related to Hyderabad Liberation Day',
        'Hack the laptop with Riya\'s help via phone',
        'Unlock the combination lock system',
        'Escape from the building'
      ],
      estimatedTime: '10-15 minutes',
      unlocked: true
    },
    {
      id: 'parkour_escape',
      name: 'PARKOUR ESCAPE',
      description: 'Navigate through narrow alleyways near Charminar. Use parkour to avoid goons while collecting useful items like biryani and phone chargers.',
      difficulty: 'Medium',
      location: 'Charminar Area - Old City Lanes',
      objectives: [
        'Parkour through narrow Hyderabadi streets',
        'Jump over broken fences and scale walls',
        'Avoid goons chasing through the market',
        'Collect hidden items: phone charger, biryani pack, map',
        'Reach the safe zone near the mosque'
      ],
      estimatedTime: '15-20 minutes',
      unlocked: false
    },
    {
      id: 'rescue_riya',
      name: 'RESCUE RIYA',
      description: 'Find and save Riya from the fake tech startup building. Combine your puzzle-solving skills with her tech expertise.',
      difficulty: 'Medium',
      location: 'Hi-Tech City - Fake Startup Building',
      objectives: [
        'Locate Riya in the underground facility',
        'Solve access code using Hyderabad landmarks',
        'Use both physical and digital puzzle skills',
        'Bypass the security system together',
        'Escape with Riya safely'
      ],
      estimatedTime: '20-25 minutes',
      unlocked: false
    },
    {
      id: 'vehicle_chase',
      name: 'THE VEHICLE CHASE',
      description: 'Steal a motorcycle and race through Hyderabad streets from MG Road to Ameerpet, avoiding Varma\'s goons and traffic.',
      difficulty: 'Hard',
      location: 'MG Road to Ameerpet via Hussain Sagar',
      objectives: [
        'Steal motorcycle from the garage',
        'Race through busy Hyderabad streets',
        'Avoid enemy vehicles and road obstacles',
        'Navigate past Hussain Sagar Lake',
        'Collect health items from roadside stalls'
      ],
      estimatedTime: '15-20 minutes',
      unlocked: false
    },
    {
      id: 'deliver_evidence',
      name: 'DELIVER THE EVIDENCE',
      description: 'Make the final moral choice: Confront Raghav Varma at his Jubilee Hills mansion or take evidence to Kachiguda Police Station.',
      difficulty: 'Hard',
      location: 'Jubilee Hills vs Kachiguda Police Station',
      objectives: [
        'Decide between confrontation or safety',
        'Navigate to chosen location',
        'Handle the consequences of your choice',
        'Expose the corruption network',
        'Save Hyderabad from Varma\'s empire'
      ],
      estimatedTime: '10-15 minutes',
      unlocked: false
    }
  ];

  const startMission = (mission: Mission) => {
    setCurrentObjective(mission.objectives[0]);
    setGamePhase('playing');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Satellite Map Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-8 h-full">
          {[...Array(64)].map((_, i) => (
            <div 
              key={i} 
              className="border border-orange-400 border-opacity-20"
              style={{
                background: Math.random() > 0.8 ? 'rgba(255, 107, 53, 0.1)' : 'transparent'
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 h-full overflow-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="spy-text text-3xl font-bold mb-2">LEVEL SELECTION</h1>
          <div className="text-orange-400 text-sm">Choose your next challenge in Hyderabad</div>
        </div>

        {/* Mission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {missions.map((mission) => (
            <div 
              key={mission.id}
              className={`spy-panel cursor-pointer transition-all duration-300 ${
                selectedMission === mission.id 
                  ? 'border-orange-400 shadow-lg shadow-orange-400/20' 
                  : mission.unlocked 
                    ? 'hover:border-yellow-400' 
                    : 'opacity-50'
              }`}
              onClick={() => mission.unlocked && setSelectedMission(mission.id)}
            >
              <div className="p-6">
                {/* Mission Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="spy-text text-lg font-bold mb-1">
                      {mission.name}
                      {!mission.unlocked && <span className="text-red-400 ml-2">[LOCKED]</span>}
                    </h3>
                    <div className="text-xs text-gray-400">{mission.location}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getDifficultyColor(mission.difficulty)}`}>
                      {mission.difficulty}
                    </div>
                    <div className="text-xs text-gray-400">{mission.estimatedTime}</div>
                  </div>
                </div>

                {/* Mission Description */}
                <p className="text-sm text-gray-300 mb-4">
                  {mission.description}
                </p>

                {/* Objectives */}
                <div className="mb-4">
                  <div className="text-xs text-orange-400 mb-2">PRIMARY OBJECTIVES:</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {mission.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-400 mr-2">▸</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mission Status */}
                <div className="flex justify-between items-center">
                  <div className="text-xs">
                    <span className="text-orange-400">STATUS:</span> 
                    <span className={mission.unlocked ? "text-orange-400" : "text-red-400"}>
                      {mission.unlocked ? " AVAILABLE" : " CLASSIFIED"}
                    </span>
                  </div>
                  {selectedMission === mission.id && mission.unlocked && (
                    <div className="text-xs text-green-400 animate-pulse">
                      SELECTED FOR DEPLOYMENT
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            className="spy-button px-8 py-3"
            onClick={() => setGamePhase('menu')}
          >
            RETURN TO HQ
          </button>
          
          {selectedMission && (
            <button
              className="spy-button px-8 py-3 bg-green-900 border-green-400"
              onClick={() => {
                const mission = missions.find(m => m.id === selectedMission);
                if (mission) startMission(mission);
              }}
            >
              INITIATE MISSION
            </button>
          )}
        </div>

        {/* Intel Brief */}
        {selectedMission && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="spy-panel">
              <div className="p-6">
                <h3 className="spy-text text-lg font-bold mb-4">INTELLIGENCE BRIEF</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-green-400 text-xs mb-1">THREAT ASSESSMENT:</div>
                    <div className="text-gray-300">
                      {selectedMission === 'warehouse_infiltration' && "Moderate security presence. Patrol patterns predictable."}
                      {selectedMission === 'rooftop_chase' && "High mobility required. Multiple pursuit units expected."}
                      {selectedMission === 'underground_network' && "Heavy security systems. Advanced hacking skills required."}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-400 text-xs mb-1">RECOMMENDED EQUIPMENT:</div>
                    <div className="text-gray-300">
                      {selectedMission === 'warehouse_infiltration' && "Lockpick kit, mini camera, stealth gear"}
                      {selectedMission === 'rooftop_chase' && "Parkour equipment, communications device"}
                      {selectedMission === 'underground_network' && "Hacking tools, drone, advanced scanner"}
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-red-900 bg-opacity-20 border border-red-400 rounded">
                  <div className="text-red-400 text-xs font-bold mb-1">⚠ MISSION CRITICAL WARNING:</div>
                  <div className="text-gray-300 text-xs">
                    Corporate security has been heightened following your initial investigation. 
                    Expect increased patrols and surveillance. Avoid detection at all costs.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
