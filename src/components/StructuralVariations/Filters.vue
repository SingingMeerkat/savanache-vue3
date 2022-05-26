<template>
  <div class="structural-variations-filters">
    <v-row>
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
          v-model="selectedRows"
          :items="svItems"
          dense
          hide-details
          label="Select SVs"
          multiple
        ></v-select>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">

import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";
import { PathRow } from "@/interfaces/path-row";

export default defineComponent({
  name: "StructuralVariationsFilters",
  components: {},
  setup() {
    const store = useStore();

    const selectedPivot = computed<string>({
      get: () => store.state.selectedPivot,
      set: (value) => store.commit("setSelectedPivot", value)
    });

    const pivotItems = ref<Array<string>>([]);
    // const selectedSVs = ref([]);
    const svItems = [
      // 'Present',
      'Insertion',
      'Swap',
      'Cooccurence',
      'Inversion',
      'InversionChain',
    ];

    getData().then((data) => {
      if (data) {
        pivotItems.value = Object.keys(data.pangenome.paths);
      }
    });

    const selectedSVs = computed<Array<string>>(() => store.state.selectedSVs);
    const setSelectedSVs = (SVs: Array<string>) => store.commit("setSelectedSVs", SVs);

    const selectedRows = ref([ ...selectedSVs.value ]);

    // const selectRow = (row: PathRow) => {
    //   selectedRows.value[row.name] = !selectedRows.value[row.name];
    //   setSelectedSVs({ ...selectedRows.value });
    //   // selectedSVs.value[row.name] = !selectedSVs.value[row.name];
    // };

    watch(selectedSVs, (newVal) => {
      console.log('watch', 'selectedSVs', 'newVal', newVal);
      if (newVal.length !== selectedRows.value.length || !selectedRows.value.every((row, i) => row === newVal[i])) {
        selectedRows.value = [ ...newVal ];
      }
    }, { deep: true });

    watch(selectedRows, (newVal) => {
      console.log('watch', 'selectedRows', 'newVal', newVal);
      if (newVal.length !== selectedSVs.value.length || !selectedSVs.value.every((row, i) => row === newVal[i])) {
        setSelectedSVs([ ...newVal ]);
      }
    }, { deep: true });

    return {
      pivotItems,
      selectedPivot,
      selectedSVs,
      svItems,
      selectedRows,
    };
  }
});
</script>

<style lang="scss" scoped>

</style>