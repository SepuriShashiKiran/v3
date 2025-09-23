import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface PlayerState {
  position: [number, number, number];
  health: number;
  stamina: number;
  stealthMode: boolean;
  isRunning: boolean;
  isCrouching: boolean;
  hasEvidence: boolean;
  evidenceCount: number;
  experience: number;
  
  // Movement state
  velocity: [number, number, number];
  isGrounded: boolean;
  canJump: boolean;
  
  // Actions
  setPosition: (position: [number, number, number]) => void;
  setHealth: (health: number) => void;
  setStamina: (stamina: number) => void;
  setStealthMode: (stealth: boolean) => void;
  setIsRunning: (running: boolean) => void;
  setIsCrouching: (crouching: boolean) => void;
  addEvidence: () => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  addExperience: (xp: number) => void;
  resetPlayer: () => void;
}

export const usePlayer = create<PlayerState>()(
  subscribeWithSelector((set, get) => ({
    position: [0, 0, 0],
    health: 100,
    stamina: 100,
    stealthMode: false,
    isRunning: false,
    isCrouching: false,
    hasEvidence: false,
    evidenceCount: 0,
    experience: 0,
    
    // Movement state
    velocity: [0, 0, 0],
    isGrounded: true,
    canJump: true,
    
    setPosition: (position) => {
      set({ position });
    },
    
    setHealth: (health) => {
      const clampedHealth = Math.max(0, Math.min(100, health));
      set({ health: clampedHealth });
      if (clampedHealth <= 0) {
        console.log("Player defeated!");
        // Trigger game over logic
      }
    },
    
    setStamina: (stamina) => {
      const clampedStamina = Math.max(0, Math.min(100, stamina));
      set({ stamina: clampedStamina });
    },
    
    setStealthMode: (stealth) => {
      if (stealth !== get().stealthMode) {
        console.log(`Stealth mode ${stealth ? 'activated' : 'deactivated'}`);
        set({ stealthMode: stealth });
      }
    },
    
    setIsRunning: (running) => {
      const { stamina } = get();
      if (running && stamina < 10) {
        // Can't run if too tired
        set({ isRunning: false });
        return;
      }
      set({ isRunning: running });
      
      // Drain stamina when running
      if (running) {
        const interval = setInterval(() => {
          const currentStamina = get().stamina;
          const currentRunning = get().isRunning;
          
          if (!currentRunning || currentStamina <= 0) {
            clearInterval(interval);
            if (currentStamina <= 0) {
              set({ isRunning: false });
            }
            return;
          }
          
          set({ stamina: Math.max(0, currentStamina - 1) });
        }, 200);
      }
    },
    
    setIsCrouching: (crouching) => {
      if (crouching !== get().isCrouching) {
        console.log(`Crouching ${crouching ? 'enabled' : 'disabled'}`);
        set({ isCrouching: crouching });
        
        // Crouching enhances stealth but reduces movement speed
        if (crouching) {
          set({ stealthMode: true });
        }
      }
    },
    
    addEvidence: () => {
      const { evidenceCount } = get();
      const newCount = evidenceCount + 1;
      console.log(`Evidence collected! Total: ${newCount}`);
      set({ 
        evidenceCount: newCount,
        hasEvidence: true,
        experience: get().experience + 50
      });
    },
    
    takeDamage: (amount) => {
      const { health } = get();
      const newHealth = Math.max(0, health - amount);
      console.log(`Player took ${amount} damage. Health: ${newHealth}`);
      set({ health: newHealth });
    },
    
    heal: (amount) => {
      const { health } = get();
      const newHealth = Math.min(100, health + amount);
      console.log(`Player healed ${amount}. Health: ${newHealth}`);
      set({ health: newHealth });
    },
    
    addExperience: (xp) => {
      const { experience } = get();
      const newXp = experience + xp;
      console.log(`Experience gained: +${xp} (Total: ${newXp})`);
      set({ experience: newXp });
    },
    
    resetPlayer: () => {
      console.log("Player state reset");
      set({
        position: [0, 0, 0],
        health: 100,
        stamina: 100,
        stealthMode: false,
        isRunning: false,
        isCrouching: false,
        hasEvidence: false,
        evidenceCount: 0,
        experience: 0,
        velocity: [0, 0, 0],
        isGrounded: true,
        canJump: true
      });
    }
  }))
);
