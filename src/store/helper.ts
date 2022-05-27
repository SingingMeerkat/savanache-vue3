import { computed, ref, unref, watch, WatchStopHandle } from "vue";
import { Commit } from "vuex";

export const reactiveVuexObject = <T extends object>(state: T, commit: Commit, mutationName: any) => {

  const selectedState = computed(() => state);
  const setSelectedState = (data: T) => commit(mutationName, data);

  const selectedLocal = ref(unref(selectedState));

  let stopStateWatch: WatchStopHandle = () => undefined;
  let stopLocalWatch: WatchStopHandle = () => undefined;

  const startWatch = () => {
    stopStateWatch();
    stopLocalWatch();

    stopStateWatch = watch(selectedState, (newVal) => {
      console.log(mutationName, 'watch', 'selectedState', 'newVal', newVal);
      stopWatch();
      selectedLocal.value = unref(newVal);
      startWatch();
    }, { deep: true });

    stopLocalWatch = watch(selectedLocal, (newVal) => {
      console.log(mutationName, 'watch', 'selectedLocal', 'newVal', newVal);
      stopWatch();
      setSelectedState(unref(newVal));
      startWatch();
    }, { deep: true });

  }

  const stopWatch = () => {
    stopStateWatch();
    stopLocalWatch();
  }

  startWatch();
  
  return selectedLocal;
}

// const clone = <T extends object | []>(obj: T) => (Array.isArray(obj) ? [...obj] : {...obj});
