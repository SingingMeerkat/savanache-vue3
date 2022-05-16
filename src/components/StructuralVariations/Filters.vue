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
    </v-row>
  </div>
</template>

<script lang="ts">

import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";

export default defineComponent({
  name: "StructuralVariationsFilters",
  components: {},
  setup() {
    const store = useStore();

    const selectedPivot = computed<string>({
      get: () => store.state.selectedPivot,
      set: (value) => store.commit("setSelectedPivot", value)
    });

    const pivotItems = ref([] as Array<string>);

    getData().then((data) => {
      if (data) {
        pivotItems.value = Object.keys(data.pangenome.paths);
      }
    });

    return {
      pivotItems,
      selectedPivot
    };
  }
});
</script>

<style lang="scss" scoped>

</style>