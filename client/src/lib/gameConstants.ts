// Game Constants for Spy Thriller Adventure Game
export const GAME_CONFIG = {
  // Player movement settings
  PLAYER: {
    WALK_SPEED: 4,
    RUN_SPEED: 8,
    CROUCH_SPEED: 2,
    JUMP_FORCE: 6,
    HEALTH_MAX: 100,
    STAMINA_MAX: 100,
    STAMINA_DRAIN_RATE: 1, // per 200ms when running
    STAMINA_REGEN_RATE: 2, // per second when not running
    STEALTH_DETECTION_MULTIPLIER: 0.5,
  },

  // Enemy AI settings
  ENEMY: {
    PATROL_SPEED: 1.5,
    CHASE_SPEED: 3,
    SEARCH_SPEED: 2,
    DETECTION_RADIUS: 8,
    ALERT_RADIUS: 15,
    SEARCH_TIME: 5, // seconds before giving up
    NIGHT_DETECTION_MULTIPLIER: 0.7,
    STEALTH_DETECTION_MULTIPLIER: 0.3,
  },

  // Gadget settings
  GADGETS: {
    DRONE: {
      FOLLOW_DISTANCE: 3,
      HEIGHT_OFFSET: 4,
      SCAN_RADIUS: 15,
      BATTERY_DURATION: 60, // seconds
      SPEED: 0.05,
    },
    LOCKPICK: {
      SUCCESS_TIME: 5, // seconds to complete
      PROGRESS_RATE: 20, // progress per second
    },
    CAMERA: {
      FLASH_DURATION: 0.5,
      COOLDOWN: 2, // seconds
      DETECTION_RANGE: 20,
    },
  },

  // Environment settings
  ENVIRONMENT: {
    DAY_CYCLE_SPEED: 0.01, // Time progression rate
    NIGHT_START: 0.75, // 18:00
    NIGHT_END: 0.25, // 06:00
    FOG_NEAR: 50,
    FOG_FAR: 200,
    SHADOW_MAP_SIZE: 2048,
  },

  // Mission objectives
  OBJECTIVES: {
    WAREHOUSE_INFILTRATION: [
      'Locate the main warehouse facility',
      'Avoid or neutralize security patrols',
      'Access the security office',
      'Retrieve classified documents',
      'Escape without triggering full alert'
    ],
    ROOFTOP_PURSUIT: [
      'Escape initial ambush',
      'Navigate rooftop obstacles',
      'Use parkour to stay ahead of pursuers',
      'Reach the helicopter extraction point',
      'Survive the pursuit'
    ],
    UNDERGROUND_CONSPIRACY: [
      'Locate the hidden entrance',
      'Hack security systems',
      'Gather intelligence on the conspiracy',
      'Photograph evidence of corruption',
      'Escape before reinforcements arrive'
    ],
  },

  // UI and visual settings
  UI: {
    HUD_OPACITY: 0.8,
    FADE_DURATION: 0.3,
    PULSE_SPEED: 2,
    DETECTION_BAR_HEIGHT: 20,
    MINIMAP_SIZE: 150,
    INVENTORY_SLOTS: 8,
  },

  // Audio settings
  AUDIO: {
    MASTER_VOLUME: 0.7,
    SFX_VOLUME: 0.5,
    MUSIC_VOLUME: 0.3,
    FOOTSTEP_INTERVALS: {
      WALK: 0.6,
      RUN: 0.3,
      CROUCH: 1.0,
    },
  },

  // Spy thriller specific constants
  SPY_THEME: {
    COLORS: {
      PRIMARY_GREEN: '#00ff41',
      SECONDARY_BLUE: '#0099ff',
      ACCENT_RED: '#ff0040',
      DARK_BG: '#0a0a0a',
      DARKER_BG: '#050505',
      WARNING: '#ffaa00',
      DANGER: '#ff0040',
      SUCCESS: '#00ff41',
    },
    FONTS: {
      PRIMARY: 'Courier New, monospace',
      SECONDARY: 'Inter, sans-serif',
    },
    ANIMATIONS: {
      PULSE_DURATION: 2000,
      FADE_DURATION: 300,
      SLIDE_DURATION: 400,
      GLOW_INTENSITY: 0.5,
    },
  },

  // Hacking minigame settings
  HACKING: {
    TIME_LIMIT: 60, // seconds
    BINARY_WORDS: ['ACCESS', 'SECURE', 'UNLOCK', 'BYPASS', 'DECODE', 'SYSTEM', 'MATRIX', 'CIPHER'],
    CIPHER_PHRASES: ['OPEN DOOR', 'MAIN FRAME', 'SHUT DOWN', 'OVERRIDE', 'TERMINAL', 'PROTOCOL', 'FIREWALL'],
    PATTERN_LENGTH: 6,
    PATTERN_GRID_SIZE: 9,
    SCORES: {
      BINARY: 100,
      CIPHER: 150,
      PATTERN: 200,
      TIME_BONUS: 5, // per second remaining
    },
  },

  // Interaction distances
  INTERACTION: {
    PICKUP_DISTANCE: 2,
    HACK_DISTANCE: 3,
    DOOR_DISTANCE: 1.5,
    CONVERSATION_DISTANCE: 4,
    EVIDENCE_DISTANCE: 2.5,
  },

  // Stealth system
  STEALTH: {
    DETECTION_LEVELS: {
      UNAWARE: 0,
      SUSPICIOUS: 25,
      SEARCHING: 50,
      ALERTED: 75,
      HOSTILE: 100,
    },
    VISIBILITY_FACTORS: {
      NIGHT: 0.7,
      CROUCH: 0.5,
      MOVEMENT: 1.2,
      RUNNING: 2.0,
      COVER: 0.3,
    },
  },

  // World positions for key locations
  WORLD_POSITIONS: {
    WAREHOUSE_MAIN: [0, 0, -30],
    ROOFTOP_START: [40, 8, 0],
    UNDERGROUND_ENTRANCE: [0, -2, 50],
    GADGET_SPAWNS: {
      DRONE: [5, 1, -10],
      LOCKPICK: [-8, 0.5, 5],
      CAMERA: [12, 0.8, -5],
    },
    ENEMY_PATROLS: [
      { start: [10, 0, 10], route: [[10, 0, 10], [10, 0, 20], [20, 0, 20], [20, 0, 10]] },
      { start: [-15, 0, 5], route: [[-15, 0, 5], [-15, 0, -5], [-25, 0, -5], [-25, 0, 5]] },
      { start: [0, 0, -20], route: [[0, 0, -20], [5, 0, -20], [5, 0, -30], [0, 0, -30]] },
    ],
  },
} as const;

// Mission difficulty modifiers
export const DIFFICULTY_MODIFIERS = {
  EASY: {
    enemyDetectionMultiplier: 0.8,
    timeMultiplier: 1.2,
    healthMultiplier: 1.2,
  },
  MEDIUM: {
    enemyDetectionMultiplier: 1.0,
    timeMultiplier: 1.0,
    healthMultiplier: 1.0,
  },
  HARD: {
    enemyDetectionMultiplier: 1.3,
    timeMultiplier: 0.8,
    healthMultiplier: 0.8,
  },
} as const;

// Key binding mappings
export const KEY_BINDINGS = {
  MOVEMENT: {
    FORWARD: ['KeyW', 'ArrowUp'],
    BACKWARD: ['KeyS', 'ArrowDown'],
    LEFT: ['KeyA', 'ArrowLeft'],
    RIGHT: ['KeyD', 'ArrowRight'],
  },
  ACTIONS: {
    RUN: ['ShiftLeft', 'ShiftRight'],
    CROUCH: ['KeyC'],
    INTERACT: ['KeyE'],
    HACK: ['KeyF'],
    PAUSE: ['Escape'],
  },
  GADGETS: {
    DRONE: ['Digit1'],
    LOCKPICK: ['Digit2'],
    CAMERA: ['Digit3'],
  },
} as const;

// Experience point values
export const XP_VALUES = {
  STEALTH_TAKEDOWN: 50,
  EVIDENCE_COLLECTED: 25,
  OBJECTIVE_COMPLETED: 100,
  MISSION_COMPLETED: 500,
  PERFECT_STEALTH: 200,
  HACKING_SUCCESS: 75,
  GADGET_MASTERY: 30,
} as const;
