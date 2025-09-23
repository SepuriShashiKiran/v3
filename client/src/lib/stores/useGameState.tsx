import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "mission_select" | "playing" | "paused" | "ended";

interface GameState {
  gamePhase: GamePhase;
  currentObjective: string | null;
  timeOfDay: number; // 0-1, where 0 is midnight, 0.5 is noon
  dayNightCycle: boolean;
  missionProgress: number; // 0-100
  alertLevel: number; // 0-100, affects enemy behavior
  
  // Actions
  setGamePhase: (phase: GamePhase) => void;
  setCurrentObjective: (objective: string) => void;
  updateTimeOfDay: (delta: number) => void;
  toggleDayNightCycle: () => void;
  setMissionProgress: (progress: number) => void;
  setAlertLevel: (level: number) => void;
  resetGameState: () => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    gamePhase: "menu",
    currentObjective: null,
    timeOfDay: 0.2, // Start at night for spy atmosphere
    dayNightCycle: true,
    missionProgress: 0,
    alertLevel: 0,
    
    setGamePhase: (phase) => {
      console.log(`Game phase changed to: ${phase}`);
      set({ gamePhase: phase });
    },
    
    setCurrentObjective: (objective) => {
      console.log(`New objective: ${objective}`);
      set({ currentObjective: objective });
    },
    
    updateTimeOfDay: (delta) => {
      const { dayNightCycle } = get();
      if (dayNightCycle) {
        set((state) => ({
          timeOfDay: (state.timeOfDay + delta * 0.01) % 1 // Slow cycle
        }));
      }
    },
    
    toggleDayNightCycle: () => {
      set((state) => ({
        dayNightCycle: !state.dayNightCycle
      }));
    },
    
    setMissionProgress: (progress) => {
      set({ missionProgress: Math.max(0, Math.min(100, progress)) });
    },
    
    setAlertLevel: (level) => {
      const clampedLevel = Math.max(0, Math.min(100, level));
      console.log(`Alert level set to: ${clampedLevel}`);
      set({ alertLevel: clampedLevel });
    },
    
    resetGameState: () => {
      console.log("Game state reset");
      set({
        gamePhase: "menu",
        currentObjective: null,
        timeOfDay: 0.2,
        dayNightCycle: true,
        missionProgress: 0,
        alertLevel: 0
      });
    }
  }))
);
