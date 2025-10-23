// TypeScript interfaces and types for mining engineering calculations

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    tension?: number;
    fill?: boolean;
    pointRadius?: number;
    borderRadius?: number;
  }[];
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  interaction?: {
    mode: string;
    intersect: boolean;
  };
  scales?: {
    x?: {
      title?: {
        display: boolean;
        text: string;
        color: string;
      };
      grid?: {
        color: string;
      };
      ticks?: {
        color: string;
      };
      max?: number;
    };
    y?: {
      title?: {
        display: boolean;
        text: string;
        color: string;
      };
      grid?: {
        color: string;
      };
      ticks?: {
        color: string;
      };
    };
  };
  plugins?: {
    legend?: {
      labels?: {
        color: string;
      };
      display?: boolean;
    };
  };
  indexAxis?: 'x' | 'y';
}

export interface LoMParams {
  capex: number;
  years: number;
  discountRate: number;
  price: number;
  oreMined: number;
  wasteMined: number;
  oreCost: number;
  wasteCost: number;
}

export interface LoMResults {
  npv: number;
  irr: number;
  annualCashFlow: number;
  discountedCashFlows: number[];
  cumulativeCashFlows: number[];
}

export interface BESRParams {
  price: number;
  oreCost: number;
  wasteCost: number;
}

export interface BESRResults {
  besr: number;
}

export interface FoSParams {
  cohesion: number;
  friction: number;
  slope: number;
  height: number;
  unitWeight: number;
}

export interface FoSResults {
  fos: number;
  resistingForce: number;
  drivingForce: number;
}

export interface RMRParams {
  strength: number;
  rqd: number;
  spacing: number;
  condition: number;
  groundwater: number;
}

export interface RMRResults {
  total: number;
  rockClass: string;
  breakdown: number[];
}

export interface RockburstParams {
  ucs: number;
  tensile: number;
  stress: number;
  ue: number;
  ud: number;
}

export interface RockburstResults {
  ssr: number;
  brittleness: number;
  wet: number;
  riskLevel: string;
  wetRisk: string;
}

export interface MonteCarloParams {
  slopeDip: number;
  slopeDipDir: number;
  j1Dip: number;
  j1DipDir: number;
  j2Dip: number;
  j2DipDir: number;
  phiMean: number;
  phiStd: number;
  cohMean: number;
  cohStd: number;
  unitWeight: number;
  height: number;
  iterations: number;
}

export interface MonteCarloResults {
  probFailure: number;
  meanFos: number;
  fosResults: number[];
}

export interface BlastParams {
  burden: number;
  spacing: number;
  diameter: number;
  height: number;
  rockDensity: number;
  expDensity: number;
  stemming: number;
  subdrill: number;
}

export interface BlastResults {
  tonnesPerHole: number;
  expWeightPerHole: number;
  powderFactor: number;
}

export interface MatchParams {
  bucket: number;
  truckCap: number;
  density: number;
  fill: number;
  numTrucks: number;
  loaderCycle: number;
  truckCycle: number;
}

export interface MatchResults {
  passes: number;
  matchFactor: number;
  loadingTime: number;
}

export interface ProductivityParams {
  bucket: number;
  density: number;
  fill: number;
  cycle: number;
  efficiency: number;
}

export interface ProductivityResults {
  productivity: number;
}

export interface PillarParams {
  material: 'hard_rock' | 'coal';
  width: number;
  height: number;
  depth: number;
  unitWeight: number;
  extraction: number;
  k?: number; // for hard rock
}

export interface PillarResults {
  strength: number;
  stress: number;
  fos: number;
}

export interface StressParams {
  depth: number;
  unitWeight: number;
  kRatio: number;
  radius: number;
  ucs: number;
  mb: number;
  s: number;
  em: number;
}

export interface StressResults {
  sv: number;
  sh: number;
  sThetaMax: number;
  po: number;
  pcr: number;
}

export interface RockProperty {
  name: string;
  ucs: number;
  density: number;
}

export interface RockDatabase {
  [category: string]: RockProperty[];
}

export interface KPIData {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  precision?: number;
}

export interface SessionData {
  [key: string]: any;
}

export interface ExportOptions {
  format: 'pdf' | 'csv';
  data: any;
  filename?: string;
}
