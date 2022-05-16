<template>
  <v-container class="structural-variations" fluid>
    StructuralVariations
    <StructuralVariationsFilters></StructuralVariationsFilters>
    <StructuralVariationsPivotComparisonTable></StructuralVariationsPivotComparisonTable>
    <StructuralVariationsAssembliesTable></StructuralVariationsAssembliesTable>
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
