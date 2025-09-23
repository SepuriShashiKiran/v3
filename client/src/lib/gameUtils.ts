import * as THREE from 'three';
import { GAME_CONFIG, DIFFICULTY_MODIFIERS } from './gameConstants';

// Vector utilities
export const vectorUtils = {
  distance2D: (pos1: [number, number, number], pos2: [number, number, number]): number => {
    const dx = pos1[0] - pos2[0];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dz * dz);
  },

  distance3D: (pos1: [number, number, number], pos2: [number, number, number]): number => {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  normalize2D: (vector: [number, number]): [number, number] => {
    const length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
    if (length === 0) return [0, 0];
    return [vector[0] / length, vector[1] / length];
  },

  lerp: (start: number, end: number, alpha: number): number => {
    return start + (end - start) * alpha;
  },

  clamp: (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
  },
};

// Time utilities
export const timeUtils = {
  formatTime: (timeOfDay: number): string => {
    const hours = Math.floor(timeOfDay * 24);
    const minutes = Math.floor((timeOfDay * 24 * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  formatDuration: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  isNight: (timeOfDay: number): boolean => {
    return timeOfDay < GAME_CONFIG.ENVIRONMENT.NIGHT_END || timeOfDay > GAME_CONFIG.ENVIRONMENT.NIGHT_START;
  },

  isDawn: (timeOfDay: number): boolean => {
    return timeOfDay >= GAME_CONFIG.ENVIRONMENT.NIGHT_END && timeOfDay <= GAME_CONFIG.ENVIRONMENT.NIGHT_END + 0.1;
  },

  isDusk: (timeOfDay: number): boolean => {
    return timeOfDay >= GAME_CONFIG.ENVIRONMENT.NIGHT_START - 0.1 && timeOfDay <= GAME_CONFIG.ENVIRONMENT.NIGHT_START;
  },
};

// Stealth calculation utilities
export const stealthUtils = {
  calculateDetectionMultiplier: (
    isNight: boolean,
    isCrouching: boolean,
    isMoving: boolean,
    isRunning: boolean,
    inCover: boolean = false
  ): number => {
    let multiplier = 1.0;

    if (isNight) {
      multiplier *= GAME_CONFIG.STEALTH.VISIBILITY_FACTORS.NIGHT;
    }

    if (isCrouching) {
      multiplier *= GAME_CONFIG.STEALTH.VISIBILITY_FACTORS.CROUCH;
    }

    if (isMoving) {
      if (isRunning) {
        multiplier *= GAME_CONFIG.STEALTH.VISIBILITY_FACTORS.RUNNING;
      } else {
        multiplier *= GAME_CONFIG.STEALTH.VISIBILITY_FACTORS.MOVEMENT;
      }
    }

    if (inCover) {
      multiplier *= GAME_CONFIG.STEALTH.VISIBILITY_FACTORS.COVER;
    }

    return multiplier;
  },

  getDetectionLevel: (detectionValue: number): keyof typeof GAME_CONFIG.STEALTH.DETECTION_LEVELS => {
    if (detectionValue >= GAME_CONFIG.STEALTH.DETECTION_LEVELS.HOSTILE) return 'HOSTILE';
    if (detectionValue >= GAME_CONFIG.STEALTH.DETECTION_LEVELS.ALERTED) return 'ALERTED';
    if (detectionValue >= GAME_CONFIG.STEALTH.DETECTION_LEVELS.SEARCHING) return 'SEARCHING';
    if (detectionValue >= GAME_CONFIG.STEALTH.DETECTION_LEVELS.SUSPICIOUS) return 'SUSPICIOUS';
    return 'UNAWARE';
  },

  isPlayerVisible: (
    playerPos: [number, number, number],
    enemyPos: [number, number, number],
    detectionRadius: number,
    stealthMultiplier: number
  ): boolean => {
    const distance = vectorUtils.distance2D(playerPos, enemyPos);
    const effectiveRadius = detectionRadius * stealthMultiplier;
    return distance <= effectiveRadius;
  },
};

// Audio utilities
export const audioUtils = {
  calculateSpatialVolume: (
    listenerPos: [number, number, number],
    soundPos: [number, number, number],
    maxDistance: number = 20
  ): number => {
    const distance = vectorUtils.distance3D(listenerPos, soundPos);
    if (distance >= maxDistance) return 0;
    return Math.max(0, 1 - (distance / maxDistance));
  },

  playFootstepSound: (
    isRunning: boolean,
    isCrouching: boolean,
    surfaceType: 'concrete' | 'metal' | 'grass' | 'wood' = 'concrete'
  ): void => {
    // This would integrate with the audio system
    const interval = isRunning 
      ? GAME_CONFIG.AUDIO.FOOTSTEP_INTERVALS.RUN
      : isCrouching 
        ? GAME_CONFIG.AUDIO.FOOTSTEP_INTERVALS.CROUCH
        : GAME_CONFIG.AUDIO.FOOTSTEP_INTERVALS.WALK;
    
    console.log(`Footstep on ${surfaceType} - interval: ${interval}s`);
  },
};

// Mission progress utilities
export const missionUtils = {
  calculateScore: (
    timeElapsed: number,
    timeLimit: number,
    stealthMaintained: boolean,
    evidenceCollected: number,
    objectivesCompleted: number
  ): number => {
    let score = 0;

    // Base completion score
    score += objectivesCompleted * 100;

    // Time bonus
    const timeRemaining = Math.max(0, timeLimit - timeElapsed);
    score += timeRemaining * 2;

    // Stealth bonus
    if (stealthMaintained) {
      score += 500;
    }

    // Evidence bonus
    score += evidenceCollected * 50;

    return score;
  },

  checkObjectiveCompletion: (
    objectiveType: string,
    playerPos: [number, number, number],
    inventory: string[]
  ): boolean => {
    switch (objectiveType) {
      case 'reach_warehouse':
        return vectorUtils.distance2D(playerPos, GAME_CONFIG.WORLD_POSITIONS.WAREHOUSE_MAIN as [number, number, number]) < 5;
      case 'collect_evidence':
        return inventory.includes('evidence_document');
      case 'hack_terminal':
        return inventory.includes('hacked_data');
      case 'escape_area':
        return vectorUtils.distance2D(playerPos, [0, 0, 0]) > 50;
      default:
        return false;
    }
  },

  getNextObjective: (currentObjectives: string[], completedObjectives: string[]): string | null => {
    const remaining = currentObjectives.filter(obj => !completedObjectives.includes(obj));
    return remaining.length > 0 ? remaining[0] : null;
  },
};

// UI utilities
export const uiUtils = {
  getHealthColor: (health: number): string => {
    if (health > 75) return GAME_CONFIG.SPY_THEME.COLORS.SUCCESS;
    if (health > 25) return GAME_CONFIG.SPY_THEME.COLORS.WARNING;
    return GAME_CONFIG.SPY_THEME.COLORS.DANGER;
  },

  getDetectionColor: (detectionLevel: number): string => {
    if (detectionLevel < 25) return GAME_CONFIG.SPY_THEME.COLORS.SUCCESS;
    if (detectionLevel < 75) return GAME_CONFIG.SPY_THEME.COLORS.WARNING;
    return GAME_CONFIG.SPY_THEME.COLORS.DANGER;
  },

  formatNumber: (num: number): string => {
    return num.toLocaleString();
  },

  generateMatrixText: (length: number = 8): string => {
    const chars = '01';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  },

  createGlowEffect: (color: string, intensity: number = 0.5): string => {
    return `0 0 ${10 * intensity}px ${color}`;
  },
};

// Hacking utilities
export const hackingUtils = {
  textToBinary: (text: string): string => {
    return text.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join(' ');
  },

  binaryToText: (binary: string): string => {
    return binary.split(' ').map(byte => 
      String.fromCharCode(parseInt(byte, 2))
    ).join('');
  },

  caesarCipher: (text: string, shift: number): string => {
    return text.split('').map(char => {
      if (char === ' ') return ' ';
      const code = char.charCodeAt(0) - 65;
      const shifted = (code + shift) % 26;
      return String.fromCharCode(shifted + 65);
    }).join('');
  },

  caesarDecipher: (text: string, shift: number): string => {
    return hackingUtils.caesarCipher(text, 26 - shift);
  },

  generateRandomPattern: (length: number, maxValue: number = 8): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * (maxValue + 1)));
  },

  calculateHackingDifficulty: (
    securityLevel: number,
    playerExperience: number
  ): { timeLimit: number; complexity: number } => {
    const baseTime = GAME_CONFIG.HACKING.TIME_LIMIT;
    const experienceMultiplier = Math.max(0.5, 1 - (playerExperience / 1000));
    const securityMultiplier = 1 + (securityLevel / 100);
    
    const timeLimit = Math.floor(baseTime * experienceMultiplier * securityMultiplier);
    const complexity = Math.min(10, Math.floor(securityLevel / 10) + 1);
    
    return { timeLimit, complexity };
  },
};

// Patrol AI utilities
export const patrolUtils = {
  calculateNextPatrolPoint: (
    currentPos: [number, number, number],
    patrolRoute: [number, number, number][],
    currentTargetIndex: number
  ): { nextPos: [number, number, number]; nextIndex: number } => {
    const targetPos = patrolRoute[currentTargetIndex];
    const distance = vectorUtils.distance2D(currentPos, targetPos);
    
    if (distance < 1) {
      // Reached current target, move to next
      const nextIndex = (currentTargetIndex + 1) % patrolRoute.length;
      return { nextPos: patrolRoute[nextIndex], nextIndex };
    }
    
    return { nextPos: targetPos, nextIndex: currentTargetIndex };
  },

  calculateMovementDirection: (
    from: [number, number, number],
    to: [number, number, number]
  ): [number, number, number] => {
    const direction = [
      to[0] - from[0],
      to[1] - from[1],
      to[2] - from[2]
    ] as [number, number, number];
    
    const length = Math.sqrt(direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2);
    if (length === 0) return [0, 0, 0];
    
    return [
      direction[0] / length,
      direction[1] / length,
      direction[2] / length
    ];
  },

  shouldSwitchToChase: (
    playerVisible: boolean,
    lastSeenTime: number,
    currentTime: number,
    alertLevel: number
  ): boolean => {
    if (playerVisible) return true;
    
    const timeSinceLastSeen = currentTime - lastSeenTime;
    const alertThreshold = 2000; // 2 seconds
    
    return timeSinceLastSeen < alertThreshold && alertLevel > 50;
  },
};

// Collision detection utilities
export const collisionUtils = {
  checkAABBCollision: (
    pos1: [number, number, number],
    size1: [number, number, number],
    pos2: [number, number, number],
    size2: [number, number, number]
  ): boolean => {
    return (
      pos1[0] - size1[0]/2 < pos2[0] + size2[0]/2 &&
      pos1[0] + size1[0]/2 > pos2[0] - size2[0]/2 &&
      pos1[1] - size1[1]/2 < pos2[1] + size2[1]/2 &&
      pos1[1] + size1[1]/2 > pos2[1] - size2[1]/2 &&
      pos1[2] - size1[2]/2 < pos2[2] + size2[2]/2 &&
      pos1[2] + size1[2]/2 > pos2[2] - size2[2]/2
    );
  },

  checkSphereCollision: (
    pos1: [number, number, number],
    radius1: number,
    pos2: [number, number, number],
    radius2: number
  ): boolean => {
    const distance = vectorUtils.distance3D(pos1, pos2);
    return distance < (radius1 + radius2);
  },

  getClosestPointOnLine: (
    lineStart: [number, number, number],
    lineEnd: [number, number, number],
    point: [number, number, number]
  ): [number, number, number] => {
    const lineVec = [
      lineEnd[0] - lineStart[0],
      lineEnd[1] - lineStart[1],
      lineEnd[2] - lineStart[2]
    ];
    
    const pointVec = [
      point[0] - lineStart[0],
      point[1] - lineStart[1],
      point[2] - lineStart[2]
    ];
    
    const lineLength = Math.sqrt(lineVec[0] ** 2 + lineVec[1] ** 2 + lineVec[2] ** 2);
    if (lineLength === 0) return lineStart;
    
    const normalizedLine = [
      lineVec[0] / lineLength,
      lineVec[1] / lineLength,
      lineVec[2] / lineLength
    ];
    
    const dot = pointVec[0] * normalizedLine[0] + pointVec[1] * normalizedLine[1] + pointVec[2] * normalizedLine[2];
    const clampedDot = Math.max(0, Math.min(lineLength, dot));
    
    return [
      lineStart[0] + normalizedLine[0] * clampedDot,
      lineStart[1] + normalizedLine[1] * clampedDot,
      lineStart[2] + normalizedLine[2] * clampedDot
    ];
  },
};

// Save/Load utilities
export const saveUtils = {
  saveGameState: (gameState: any): void => {
    try {
      const serializedState = JSON.stringify(gameState);
      localStorage.setItem('spy_game_save', serializedState);
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  },

  loadGameState: (): any | null => {
    try {
      const serializedState = localStorage.getItem('spy_game_save');
      if (serializedState) {
        return JSON.parse(serializedState);
      }
      return null;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  },

  clearSaveData: (): void => {
    localStorage.removeItem('spy_game_save');
    console.log('Save data cleared');
  },
};

// Performance utilities
export const performanceUtils = {
  throttle: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return (...args: Parameters<T>) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  },

  debounce: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  measurePerformance: (name: string, func: () => void): void => {
    const startTime = performance.now();
    func();
    const endTime = performance.now();
    console.log(`${name} took ${endTime - startTime} milliseconds`);
  },
};
