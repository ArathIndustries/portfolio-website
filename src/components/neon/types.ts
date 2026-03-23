export interface NeonBridge {
  letterZones: Element[];
  brightnessDips: { idx: number; drop: number }[];
  avgBrightness: number;
  signCenter: { x: number; y: number } | null;
}

export interface Wave {
  startTime: number;
  mode: 'linear' | 'ripple' | 'single';
  direction?: number;
  speed?: number;
  dip: number;
  holdMs: number;
  recoveryMs: number;
  origin?: number;
  target?: number;
  bounce?: boolean;
}
