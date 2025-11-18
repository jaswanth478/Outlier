export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  isThinking?: boolean;
}

export interface OutlierStats {
  technical: number;
  vision: number;
  grit: number;
  speed: number;
  network: number;
}

export enum SarMode {
  DEFAULT = 'Normal',
  SAR = 'SAR',
  SAR1 = 'SAR 1',
}