<template>
  <v-row class="structural-variations-filters">
    <v-col cols="6">
      <v-select
        v-model="selectedPivot"
        :items="pivotItems"
        dense
        hide-details
        label="Selected Pivot"
      ></v-select>
    </v-col>
    <v-col cols="6">
      <v-select
        v-model="selectedSVs"
        :items="svItems"
        dense
        hide-details
        label="Select SVs"
        multiple
      ></v-select>
    </v-col>
  </v-row>
</template>

<script lang="ts">

import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";
import { PathRow } from "@/interfaces/path-row";
import { reactiveVuexObject } from "@/store/helper";

export default defineComponent({
  name: "StructuralVariationsFilters",
  components: {},
  setup() {
    const store = useStore();

    const selectedPivot = computed<string>({
      get: () => store.state.selectedPivot,
      set: (value) => store.commit("setSelectedPivot", value)
    });
    const selectedSVs = reactiveVuexObject(store.state.selectedSVs, store.commit, "setSelectedSVs");

    const pivotItems = ref<Array<string>>([]);

    getData().then((data) => {
      if (data) {
        pivotItems.value = Object.keys(data.pangenome.paths);
      }
    });

    const svItems = [
      'Insertion',
      'Swap',
      'Cooccurence',
      'Inversion',
      'InversionChain',
    ];

    return {
      pivotItems,
      selectedPivot,
      svItems,
      selectedSVs,
    };
  }
});
</script>

<style lang="scss" scoped>

</style>