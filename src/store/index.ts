import { createStore } from "vuex";
import { PanNode, PanNodes, Paths } from "@/interfaces/pangenome-json";
import { PivotNode } from "@/interfaces/pivot-json";

export default createStore({
  state: {
    selectedAssemblies: {} as SelectedAssemblies,
    selectedSVs: [] as SelectedSVs,
    selectedPivot: "" as SelectedPivot,
    selectedBlock: { assembly: undefined, pivot: undefined, block: undefined } as SelectedBlock
  },
  getters: {},
  mutations: {
    setSelectedAssemblies(state, selectedAssemblies: SelectedAssemblies) {
      console.log("setSelectedAssemblies", selectedAssemblies);
      state.selectedAssemblies = selectedAssemblies;
    },
    setSelectedSVs(state, selectedSVs: SelectedSVs) {
      console.log("setSelectedSVs", selectedSVs);
      state.selectedSVs = selectedSVs;
    },
    setSelectedPivot(state, selectedPivot: SelectedPivot) {
      console.log("setSelectedPivot", selectedPivot);
      state.selectedPivot = selectedPivot;
    },
    setSelectedBlock(state, selectedBlock: SelectedBlock) {
      console.log("setSelectedBlock", selectedBlock);
      state.selectedBlock = selectedBlock;
    }
  },
  actions: {},
  modules: {}
});

export interface SelectedAssemblies {
  [k: string]: boolean;
}

export type SelectedSVs = Array<string>;

export type SelectedPivot = string;

export interface SelectedBlock {
  assembly: undefined | keyof Paths;
  pivot: undefined | keyof Paths;
  block: undefined | keyof PanNodes<PanNode> | keyof PanNodes<PivotNode>;
}