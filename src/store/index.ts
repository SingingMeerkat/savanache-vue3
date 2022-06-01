import { createStore } from "vuex";
import { PanNodes, Paths } from "@/interfaces/pangenome-json";

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

export type SelectedPivot = keyof Paths<never>;

export interface SelectedBlock {
  assembly: undefined | keyof Paths<never>;
  pivot: undefined | keyof Paths<never>;
  block: undefined | keyof PanNodes<never>;
}