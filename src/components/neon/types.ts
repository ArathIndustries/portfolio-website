export interface TubeCardHandle {
  element: HTMLDivElement;
  midpoints: { midX: number; midY: number }[];
  lightSegs: SVGPathElement[];
  coreSegs: SVGPathElement[];
  bloom: SVGPathElement;
  applyBrightness: (brightness: Float32Array) => void;
}

export interface WaveState {
  brightness: Float32Array;
  avgBrightness: number;
}

export interface NeonGridContextValue {
  registerCard: (idx: number, handle: TubeCardHandle) => void;
  registerNode: (id: string, type: string, element: HTMLElement) => void;
}

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
