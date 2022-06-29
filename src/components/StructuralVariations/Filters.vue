<template>
  <v-row class="structural-variations-filters">
    <v-col cols="4">
      <v-select
        v-model="selectedPivot"
        :items="pivotItems"
        dense
        hide-details
        label="Selected Pivot"
      ></v-select>
    </v-col>
    <v-col cols="4">
      <v-select
        v-model="selectedSVs"
        :items="svItems"
        dense
        hide-details
        label="Select SVs"
        multiple
      ></v-select>
    </v-col>
    <v-col cols="4" class="d-flex">

      <v-slider
        v-model="lengthMin"
        :min="1"
        :max="lengthMax-100"
        :step="100"
        placeholder="Min Length"
        label="Min Length"
        hide-details
        class="v-col-6"
        thumb-label
      >
        <template v-slot:prepend>
          <v-text-field
            v-model="lengthMin"
            type="number"
            density="compact"
            hide-details
            variant="outlined"
            placeholder="Min Length"
            label="Min Length"
          ></v-text-field>
        </template>
      </v-slider>

      <v-slider
        v-model="lengthMax"
        :min="lengthMin+100"
        :max="10000"
        :step="100"
        placeholder="Max Length"
        label="Max Length"
        hide-details
        class="v-col-6"
        thumb-label
      >
        <template v-slot:append>
          <v-text-field
            v-model="lengthMax"
            type="number"
            density="compact"
            hide-details
            variant="outlined"
            placeholder="Max Length"
            label="Max Length"
          ></v-text-field>
        </template>
      </v-slider>

    </v-col>
  </v-row>
</template>

<script>

import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";
import { reactiveVuex } from "@/store/helper";

export default defineComponent({
  name: "StructuralVariationsFilters",
  components: {},
  setup() {
    const store = useStore();
    const selectedPivot = reactiveVuex(store, "selectedPivot", "setSelectedPivot");
    const selectedSVs = reactiveVuex(store, "selectedSVs", "setSelectedSVs");

    const pivotItems = ref([]);

    const lengthMin = ref(1);
    const lengthMax = ref(10000);

    getData().then((data) => {
      if (data) {
        pivotItems.value = Object.keys(data.pangenome.paths);
      }
    });

    const svItems = [
      "Insertion",
      "Swap",
      "cooccurrence",
      "Inversion",
      "InversionChain"
    ];

    return {
      pivotItems,
      selectedPivot,
      svItems,
      selectedSVs,
      lengthMin,
      lengthMax,
    };
  }
});
</script>

<style lang="scss" scoped>

::v-deep .v-field__input input {
  width: 60px;
}

</style>