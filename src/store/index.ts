import { createStore } from "vuex";

export default createStore({
  state: {
    selectedAssemblies: {} as { [k: string]: boolean },
    selectedPivot: ""
  },
  getters: {},
  mutations: {
    setSelectedAssemblies(state, selectedAssemblies) {
      console.log("setSelectedAssemblies", selectedAssemblies);
      state.selectedAssemblies = selectedAssemblies;
    },
    setSelectedPivot(state, selectedPivot) {
      console.log("setSelectedPivot", selectedPivot);
      state.selectedPivot = selectedPivot;
    }
  },
  actions: {},
  modules: {}
});
