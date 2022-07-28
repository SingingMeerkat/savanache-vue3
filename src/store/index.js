import { createStore } from "vuex";

export default createStore({
  state: {
    selectedAssemblyNameKeys: {},
    selectedSVTypeNames: [],
    selectedPivotName: "",
    selectedBlock: { comparisonName: undefined, pivotName: undefined, blockName: undefined },
    lengthFilter: [0, 0],
    lengthLimit: [0, 0],
    positionFilter: [0, 0],
    positionLimit: [0, 0]
  },
  getters: {},
  mutations: {
    setselectedAssemblyNameKeys(state, selectedAssemblyNameKeys) {
      console.log("setselectedAssemblyNameKeys", selectedAssemblyNameKeys);
      state.selectedAssemblyNameKeys = selectedAssemblyNameKeys;
    },
    setselectedSVTypeNames(state, selectedSVTypeNames) {
      console.log("setselectedSVTypeNames", selectedSVTypeNames);
      state.selectedSVTypeNames = selectedSVTypeNames;
    },
    setselectedPivotName(state, selectedPivotName) {
      console.log("setselectedPivotName", selectedPivotName);
      state.selectedPivotName = selectedPivotName;
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
    }
  },
  actions: {},
  modules: {}
});

// export interface selectedAssemblyNameKeys {
//   [k: string]: boolean;
// }
//
// export type selectedSVTypeNames = Array<string>;
//
// export type selectedPivotName = keyof Paths<never>;
//
// export interface SelectedBlock {
//   assembly: undefined | keyof Paths<never>;
//   pivot: undefined | keyof Paths<never>;
//   block: undefined | keyof Pannodes<never>;
// }