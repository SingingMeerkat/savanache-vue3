import { createStore } from "vuex";

export default createStore({
  state: {
    selectedAssemblies: {},
    selectedSVs: [],
    selectedPivot: "",
    selectedBlock: { assembly: undefined, pivot: undefined, block: undefined },
    lengthFilter: [0, 0],
    lengthLimit: [0, 0],
    positionFilter: [0, 0],
    positionLimit: [0, 0],
  },
  getters: {},
  mutations: {
    setSelectedAssemblies(state, selectedAssemblies) {
      console.log("setSelectedAssemblies", selectedAssemblies);
      state.selectedAssemblies = selectedAssemblies;
    },
    setSelectedSVs(state, selectedSVs) {
      console.log("setSelectedSVs", selectedSVs);
      state.selectedSVs = selectedSVs;
    },
    setSelectedPivot(state, selectedPivot) {
      console.log("setSelectedPivot", selectedPivot);
      state.selectedPivot = selectedPivot;
    },
    setSelectedBlock(state, selectedBlock) {
      console.log("setSelectedBlock", selectedBlock);
      state.selectedBlock = selectedBlock;
    },
    setLengthFilter(state, lengthFilter) {
      console.log("setLengthFilter", lengthFilter);
      state.lengthFilter = lengthFilter;
    },
    setLengthLimit(state, lengthLimit) {
      console.log("setLengthLimit", lengthLimit);
      state.lengthLimit = lengthLimit;
    },
    setPositionFilter(state, positionFilter) {
      console.log("setPositionFilter", positionFilter);
      state.positionFilter = positionFilter;
    },
    setPositionLimit(state, positionLimit) {
      console.log("setPositionLimit", positionLimit);
      state.positionLimit = positionLimit;
    },
  },
  actions: {},
  modules: {}
});

// export interface SelectedAssemblies {
//   [k: string]: boolean;
// }
//
// export type SelectedSVs = Array<string>;
//
// export type SelectedPivot = keyof Paths<never>;
//
// export interface SelectedBlock {
//   assembly: undefined | keyof Paths<never>;
//   pivot: undefined | keyof Paths<never>;
//   block: undefined | keyof PanNodes<never>;
// }