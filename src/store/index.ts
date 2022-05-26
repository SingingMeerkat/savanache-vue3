import { createStore } from "vuex";

export default createStore({
  state: {
    selectedAssemblies: {} as { [k: string]: boolean },
    selectedSVs: [] as Array<string>,
    selectedPivot: ""
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
    }
  },
  actions: {},
  modules: {}
});
