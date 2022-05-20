export interface PivotJson {
  Aphrodite?: Pivot;
  // Ganymede?: Pivot;
  // Leonidas?: Pivot;
}

export interface Pivot {
  Node_A_0: PivotNode;
  Node_A_1: PivotNode;
  Node_B: PivotNode;
  Node_D: PivotNode;
  Node_E: PivotNode;
  Node_F: PivotNode;
  Node_G: PivotNode;
  Node_H_0: PivotNode;
  Node_H_1: PivotNode;
  Node_I: PivotNode;
  Node_J: PivotNode;
  Node_A_2: PivotNode;
  Node_N: PivotNode;
  Node_M: PivotNode;
  Node_O: PivotNode;
  Node_P: PivotNode;
  Node_Q: PivotNode;
  Node_R: PivotNode;
  Node_U: PivotNode;
  Node_V: PivotNode;
}

export interface PivotNode {
  // Aphrodite?: PathNode;
  Ganymede?: PathNode;
  Leonidas?: PathNode;
}

export interface PathNode {
  Present?: boolean;
  Insertion?: boolean;
  Swap?: boolean | string;
  Cooccurence?: boolean;
  Inversion?: boolean;
  InversionChain?: boolean | string;
}
