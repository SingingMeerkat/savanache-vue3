<template>
  <div class="structural-variations-pivot-details">
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
import { defineComponent } from "vue";

export default defineComponent({
  name: "StructuralVariationsPivotDetails",
  components: {},
  setup() {
  }
});

</script>

<style lang="scss">

</style>