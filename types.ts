export enum ShapeType {
  SATURN = 'SATURN',
  HEART = 'HEART',
  PUPPY = 'PUPPY',
  CAKE = 'CAKE',
  TEXT = 'TEXT',
  SNOWFLAKE = 'SNOWFLAKE',
  GIFT_BOX = 'GIFT_BOX',
  SCROLL = 'SCROLL',
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