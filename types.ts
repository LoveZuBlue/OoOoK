export enum ShapeType {
  SATURN = 'SATURN',
  HEART = 'HEART',
  CAKE = 'CAKE',
  TEXT = 'TEXT',
  SNOWFLAKE = 'SNOWFLAKE',
}

export interface ParticleState {
  x: number;
  y: number;
  z: number;
}

export interface UIState {
  currentShape: ShapeType;
  isScatterMode: boolean;
  phrase: string;
  showPhrase: boolean;
}