import { createStore } from "vuex";
import pangenomes from "@/store/modules/pangenomes";
import assemblies from "@/store/modules/assemblies";
import chart from "@/store/modules/chart";

export default createStore({
  modules: { assemblies, pangenomes, chart },

  state: {
    selectedAssemblyNames: [],
    selectedSVTypeNames: [],
    selectedPivotName: "",
    selectedBlock: { comparisonName: undefined, pivotName: undefined, blockName: undefined },
    lengthFilter: [0, 0],
    lengthLimit: [0, 0],
    positionFilter: [0, 0],
    positionLimit: [0, 0],
    chromOnDisplay: ""
    //chromOnDisplay: 'Gm01',
  },
  getters: {},
  mutations: {
    setSelectedAssemblyNames(state, selectedAssemblyNames) {
      console.log("setSelectedAssemblyNames", selectedAssemblyNames);
      state.selectedAssemblyNames = selectedAssemblyNames;
    },
    setSelectedSVTypeNames(state, selectedSVTypeNames) {
      console.log("setSelectedSVTypeNames", selectedSVTypeNames);
      state.selectedSVTypeNames = selectedSVTypeNames;
    },
    setSelectedPivotName(state, selectedPivotName) {
      console.log("setSelectedPivotName", selectedPivotName);
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
    },
    setChromOnDisplay(state, chromOnDisplay) {
      console.log("setChromOnDisplay", chromOnDisplay);
      state.chromOnDisplay = chromOnDisplay;
    }
  },
  actions: {}
});

// export interface selectedAssemblyNames {
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