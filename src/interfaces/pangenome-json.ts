export interface PangenomeJson {
  panSkeleton: Pannodes<PanNode>;
  paths: Paths<Path>;
}

export interface Paths<T> {
  Aphrodite?: T;
  Ganymede?: T;
  Leonidas?: T;
}

export interface Path {
  steps: Step[];
}

export interface Step {
  panBlock: keyof Pannodes<PanNode>;
  startPosition: number;
  strand: number;
}

export interface Pannodes<T> {
  Node_A_0: T;
  Node_A_1: T;
  Node_A_2: T;
  Node_A_3: T;
  Node_A_4: T;
  Node_A_5: T;
  Node_B: T;
  Node_C: T;
  Node_D: T;
  Node_E: T;
  Node_F: T;
  Node_G: T;
  Node_H_0: T;
  Node_H_1: T;
  Node_I: T;
  Node_J: T;
  Node_K: T;
  Node_L: T;
  Node_M: T;
  Node_N: T;
  Node_O: T;
  Node_P: T;
  Node_Q: T;
  Node_R: T;
  Node_S: T;
  Node_T: T;
  Node_U: T;
  Node_V: T;
}

export interface PanNode {
  length: number;
  traversals: Traversals;
  dupes: (keyof Pannodes<PanNode>)[];
  neighbors: neighbors;

}

export interface neighbors {
  before: (keyof Pannodes<PanNode>)[];
  after: (keyof Pannodes<PanNode>)[];
}

export interface Traversals {
  Aphrodite?: number;
  Ganymede?: number;
  Leonidas?: number;
}
