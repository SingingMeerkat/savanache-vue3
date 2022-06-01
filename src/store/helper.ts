import { computed, Ref, ref, unref, UnwrapRef, watch, WatchStopHandle } from "vue";
import { Store } from "vuex";

// So this is technically relying on tracking by reference, and then the watches just sit on top of that to make things official.
// Really it should work without it but I haven't been able to figure it out, maybe there's some magic behind the scenes that only really works in a component
// In the meantime I'm going to use this because it works
// export const reactiveVuexObject = <T extends object>(state: T, commit: Commit, mutationName) => {
//
//   const selectedState = computed(() => state);
//   const setSelectedState = (data: T) => commit(mutationName, data);
//
//   const selectedLocal = ref(unref(selectedState));
//
//   let stopStateWatch: WatchStopHandle = () => undefined;
//   let stopLocalWatch: WatchStopHandle = () => undefined;
//
//   const startWatch = () => {
//     stopStateWatch();
//     stopLocalWatch();
//
//     stopStateWatch = watch(selectedState, (newVal) => {
//       console.log(mutationName, 'watch', 'selectedState', 'newVal', newVal);
//       stopWatch();
//       selectedLocal.value = unref(newVal);
//       startWatch();
//     }, { deep: true });
//
//     stopLocalWatch = watch(selectedLocal, (newVal) => {
//       console.log(mutationName, 'watch', 'selectedLocal', 'newVal', newVal);
//       stopWatch();
//       setSelectedState(unref(newVal));
//       startWatch();
//     }, { deep: true });
//
//   }
//
//   const stopWatch = () => {
//     stopStateWatch();
//     stopLocalWatch();
//   }
//
//   startWatch();
//
//   return selectedLocal;
// }

export const reactiveVuex = <T>(store: Store<any>, stateName: string, mutationName: string): Ref<UnwrapRef<T>> => {

  const selectedState = computed(() => store.state[stateName]);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const setSelectedState = (data) => store.commit(mutationName, data);

  const selectedLocal = ref<T>(clone(unref(selectedState)));

  let stopStateWatch: WatchStopHandle = () => undefined;
  let stopLocalWatch: WatchStopHandle = () => undefined;

  const startWatch = () => {
    stopStateWatch();
    stopLocalWatch();

    stopStateWatch = watch(selectedState, (newVal) => {
      console.log(stateName, mutationName, "watch", "selectedState", "newVal", newVal);
      stopWatch();
      selectedLocal.value = clone(unref(newVal));
      startWatch();
    }, { deep: true });

    stopLocalWatch = watch(selectedLocal, (newVal) => {
      console.log(stateName, mutationName, "watch", "selectedLocal", "newVal", newVal);
      stopWatch();
      setSelectedState(clone(unref(newVal)));
      startWatch();
    }, { deep: true });

  };

  const stopWatch = () => {
    stopStateWatch();
    stopLocalWatch();
  };

  startWatch();

  return selectedLocal;
};


const clone = <T>(obj: T) => {
  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      return [...obj];
    } else {
      return { ...obj };
    }
  }
  return obj;
};
