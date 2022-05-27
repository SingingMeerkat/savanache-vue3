import { computed, ref, watch } from "vue";
import { Commit } from "vuex";

export const reactiveVuexObject = <T extends object>(state: T, commit: Commit, mutationName: any) => {

  const selectedState = computed(() => state);
  const setSelectedState = (data: T) => commit(mutationName, data);

  const selectedLocal = ref(clone(selectedState.value ));

  const startWatch = () => {
    const stopStateWatch = watch(selectedState, (newVal) => {
      console.log(mutationName, 'watch', 'selectedState', 'newVal', newVal);
      stopWatch();
      selectedLocal.value = clone(newVal);
      startWatch();
    }, { deep: true });

    const stopLocalWatch = watch(selectedLocal, (newVal) => {
      console.log(mutationName, 'watch', 'selectedLocal', 'newVal', newVal);
      stopWatch();
      setSelectedState(clone(newVal));
      startWatch();
    }, { deep: true });

    return {stopStateWatch, stopLocalWatch};
  }

  const {stopStateWatch, stopLocalWatch} = startWatch();

  const stopWatch = () => {
    stopStateWatch();
    stopLocalWatch();
  }

  return selectedLocal;
}

const clone = <T extends object | []>(obj: T) => (Array.isArray(obj) ? [...obj] : {...obj});
