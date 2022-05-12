export interface PivotJson {
  Aphrodite: Pivot;
}

export interface Pivot {
  Node_A_0: NodeA0;
  Node_A_1: NodeA0;
  Node_B: NodeB;
  Node_D: NodeD;
  Node_E: NodeE;
  Node_F: NodeF;
  Node_G: NodeE;
  Node_H_0: NodeH0;
  Node_H_1: NodeH1;
  Node_I: NodeI;
  Node_J: NodeI;
  Node_A_2: NodeA2;
  Node_N: NodeE;
  Node_M: NodeE;
  Node_O: NodeB;
  Node_P: NodeP;
  Node_Q: NodeQ;
  Node_R: NodeP;
  Node_U: NodeB;
  Node_V: NodeV;
}

export interface NodeV {
  Ganymede: Leonidas5;
  Leonidas: Leonidas5;
}

export interface NodeQ {
  Ganymede: Ganymede6;
  Leonidas: Ganymede5;
}

export interface Ganymede6 {
  Present: boolean;
  Inversion: boolean;
}

export interface NodeP {
  Ganymede: Ganymede2;
  Leonidas: Leonidas5;
}

export interface Leonidas5 {
  Present: boolean;
  Swap: string;
}

export interface NodeA2 {
  Ganymede: Ganymede4;
  Leonidas: Leonidas4;
}

export interface Leonidas4 {
  Present: boolean;
  Cooccurence: boolean;
  Insertion: boolean;
}

export interface NodeI {
  Ganymede: Ganymede5;
  Leonidas: Ganymede2;
}

export interface Ganymede5 {
  Present: boolean;
  Swap: boolean;
}

export interface NodeH1 {
  Ganymede: Ganymede4;
  Leonidas: Leonidas3;
}

export interface Leonidas3 {
  Present: boolean;
  Cooccurence: boolean;
  Inversion: boolean;
}

export interface Ganymede4 {
  Present: boolean;
  Swap: string;
  Cooccurence: boolean;
}

export interface NodeH0 {
  Ganymede: Ganymede2;
  Leonidas: Ganymede;
}

export interface NodeF {
  Ganymede: Ganymede2;
  Leonidas: Leonidas2;
}

export interface Leonidas2 {
  Present: boolean;
  InversionChain: boolean;
}

export interface NodeE {
  Ganymede: Ganymede2;
  Leonidas: Leonidas;
}

export interface Leonidas {
  Present: boolean;
  InversionChain: string;
}

export interface NodeD {
  Ganymede: Ganymede3;
  Leonidas: Ganymede2;
}

export interface Ganymede3 {
  Present: boolean;
  Insertion: boolean;
}

export interface NodeB {
  Ganymede: Ganymede2;
  Leonidas: Ganymede2;
}

export interface Ganymede2 {
  Present: boolean;
}

export interface NodeA0 {
  Ganymede: Ganymede;
  Leonidas: Ganymede;
}

export interface Ganymede {
  Cooccurence: boolean;
  Present: boolean;
}
