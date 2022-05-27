<template>
  <v-container class="structural-variations" fluid>
    <v-row>
      <v-col cols="12">
        <StructuralVariationsFilters></StructuralVariationsFilters>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <StructuralVariationsPivotComparisonTable></StructuralVariationsPivotComparisonTable>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <StructuralVariationsAssembliesTable></StructuralVariationsAssembliesTable>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import StructuralVariationsAssembliesTable from "../components/StructuralVariations/AssembliesTable.vue";
import StructuralVariationsFilters from "../components/StructuralVariations/Filters.vue";
import StructuralVariationsPivotComparisonTable from "../components/StructuralVariations/PivotComparisonTable.vue";

export default defineComponent({
  name: "StructuralVariations",
  components: {
    StructuralVariationsFilters,
    StructuralVariationsPivotComparisonTable,
    StructuralVariationsAssembliesTable
  },
  setup() {
    return {};
  }
});
</script>

<style lang="scss" scoped>

</style>
