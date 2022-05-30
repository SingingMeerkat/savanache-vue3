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

import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";
import { reactiveVuex } from "@/store/helper";

export default defineComponent({
  name: "StructuralVariationsFilters",
  components: {},
  setup() {
    const store = useStore();
    const selectedPivot = reactiveVuex<typeof store.state.selectedPivot>(store, "selectedPivot", "setSelectedPivot");
    const selectedSVs = reactiveVuex<typeof store.state.selectedSVs>(store, "selectedSVs", "setSelectedSVs");

    const pivotItems = ref<Array<string>>([]);

    getData().then((data) => {
      if (data) {
        pivotItems.value = Object.keys(data.pangenome.paths);
      }
    });

    const svItems = [
      "Insertion",
      "Swap",
      "Cooccurence",
      "Inversion",
      "InversionChain"
    ];

    return {
      pivotItems,
      selectedPivot,
      svItems,
      selectedSVs
    };
  }
});
</script>

<style lang="scss" scoped>

</style>