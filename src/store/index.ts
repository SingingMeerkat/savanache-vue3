import { createStore } from "vuex";

export default createStore({
  state: {
    selectedAssemblies: [],
  },
  getters: {},
  mutations: {
    setSelectedAssemblies(state, selectedAssemblies) {
      state.selectedAssemblies = selectedAssemblies;
    },
  },
  actions: {
    setSelectedAssemblies({ commit, state }, selectedAssemblies) {
      commit("setSelectedAssemblies", selectedAssemblies);
    },
  },
  modules: {},
});
