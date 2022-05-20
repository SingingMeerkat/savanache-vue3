export interface PangenomeJson {
  panSkeleton: PanSkeleton;
  paths: Paths;
}

export interface Paths {
  Aphrodite: Path;
  Ganymede: Path;
  Leonidas: Path;
}

export interface Path {
  steps: Step[];
}

export interface Step {
  panBlock: string;
  startPosition: number;
  strand: number;
}

export interface PanSkeleton {
  Node_A_0: PanNode;
  Node_A_1: PanNode;
  Node_A_2: PanNode;
  Node_A_3: PanNode;
  Node_A_4: PanNode;
  Node_A_5: PanNode;
  Node_B: PanNode;
  Node_C: PanNode;
  Node_D: PanNode;
  Node_E: PanNode;
  Node_F: PanNode;
  Node_G: PanNode;
  Node_H_0: PanNode;
  Node_H_1: PanNode;
  Node_I: PanNode;
  Node_J: PanNode;
  Node_K: PanNode;
  Node_L: PanNode;
  Node_M: PanNode;
  Node_N: PanNode;
  Node_O: PanNode;
  Node_P: PanNode;
  Node_Q: PanNode;
  Node_R: PanNode;
  Node_S: PanNode;
  Node_T: PanNode;
  Node_U: PanNode;
  Node_V: PanNode;
}

export interface PanNode {
  length: number;
  traversals: Traversals;
  cooccurrences: string[];
  neighborNodes: NeighborNodes;
  
}

export interface NeighborNodes {
  before: string[];
  after: string[];
}

export interface NeighborNodes {
  before: string[];
  after: string[];
}

export interface Traversals {
  Aphrodite?: number;
  Ganymede?: number;
  Leonidas?: number;
}
