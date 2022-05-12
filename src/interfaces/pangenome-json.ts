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
  Node_A_0: NodeA0;
  Node_A_1: NodeA1;
  Node_A_2: NodeA2;
  Node_A_3: NodeA3;
  Node_A_4: NodeA4;
  Node_A_5: NodeA5;
  Node_B: NodeB;
  Node_C: NodeC;
  Node_D: NodeD;
  Node_E: NodeB;
  Node_F: NodeB;
  Node_G: NodeB;
  Node_H_0: NodeH0;
  Node_H_1: NodeA2;
  Node_I: NodeI;
  Node_J: NodeI;
  Node_K: NodeK;
  Node_L: NodeL;
  Node_M: NodeB;
  Node_N: NodeB;
  Node_O: NodeB;
  Node_P: NodeP;
  Node_Q: NodeD;
  Node_R: NodeD;
  Node_S: NodeK;
  Node_T: NodeK;
  Node_U: NodeB;
  Node_V: NodeV;
}

export interface NodeV {
  length: number;
  traversals: Traversals;
  cooccurrences: any[];
  neighborNodes: NeighborNodes3;
}

export interface NodeP {
  length: number;
  traversals: Traversals7;
  cooccurrences: any[];
  neighborNodes: NeighborNodes4;
}

export interface NeighborNodes4 {
  before: any[];
  after: any[];
}

export interface NodeL {
  length: number;
  traversals: Traversals4;
  cooccurrences: any[];
  neighborNodes: NeighborNodes2;
}

export interface NodeK {
  length: number;
  traversals: Traversals3;
  cooccurrences: any[];
  neighborNodes: NeighborNodes2;
}

export interface NodeI {
  length: number;
  traversals: Traversals2;
  cooccurrences: any[];
  neighborNodes: NeighborNodes2;
}

export interface NodeH0 {
  length: number;
  traversals: Traversals6;
  cooccurrences: string[];
  neighborNodes: NeighborNodes2;
}

export interface NodeD {
  length: number;
  traversals: Traversals7;
  cooccurrences: any[];
  neighborNodes: NeighborNodes2;
}

export interface Traversals7 {
  Aphrodite: number;
  Ganymede: number;
}

export interface NodeC {
  length: number;
  traversals: Traversals5;
  cooccurrences: any[];
  neighborNodes: NeighborNodes2;
}

export interface NodeB {
  length: number;
  traversals: Traversals6;
  cooccurrences: any[];
  neighborNodes: NeighborNodes2;
}

export interface Traversals6 {
  Aphrodite: number;
  Ganymede: number;
  Leonidas: number;
}

export interface NodeA5 {
  length: number;
  traversals: Traversals5;
  cooccurrences: string[];
  neighborNodes: NeighborNodes3;
}

export interface NeighborNodes3 {
  before: string[];
  after: any[];
}

export interface Traversals5 {
  Ganymede: number;
}

export interface NodeA4 {
  length: number;
  traversals: Traversals4;
  cooccurrences: string[];
  neighborNodes: NeighborNodes2;
}

export interface Traversals4 {
  Ganymede: number;
  Leonidas: number;
}

export interface NodeA3 {
  length: number;
  traversals: Traversals3;
  cooccurrences: string[];
  neighborNodes: NeighborNodes2;
}

export interface Traversals3 {
  Leonidas: number;
}

export interface NodeA2 {
  length: number;
  traversals: Traversals2;
  cooccurrences: string[];
  neighborNodes: NeighborNodes2;
}

export interface Traversals2 {
  Aphrodite: number;
  Leonidas: number;
}

export interface NodeA1 {
  length: number;
  traversals: Traversals;
  cooccurrences: string[];
  neighborNodes: NeighborNodes2;
}

export interface NeighborNodes2 {
  before: string[];
  after: string[];
}

export interface NodeA0 {
  length: number;
  traversals: Traversals;
  cooccurrences: string[];
  neighborNodes: NeighborNodes;
}

export interface NeighborNodes {
  before: any[];
  after: string[];
}

export interface Traversals {
  Aphrodite: number;
}
