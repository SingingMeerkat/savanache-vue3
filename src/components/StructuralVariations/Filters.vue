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
      <v-col cols="2">
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

        <v-range-slider
          v-model="positionFilter"
          :min="positionLimit[0]"
          :max="positionLimit[1]"
          :step="positionStep"
          placeholder="Position"
          label="Position"
          hide-details
          class="v-col-12"
          thumb-label
          :disabled="!positionLimit[1]"
        >
          <template v-slot:prepend>
            <v-text-field
              v-model="positionFilter[0]"
              type="number"
              density="compact"
              hide-details
              variant="outlined"
              placeholder="Min Position"
              label="Min Position"
              :disabled="!positionLimit[1]"
            ></v-text-field>
          </template>
          <template v-slot:append>
            <v-text-field
              v-model="positionFilter[1]"
              type="number"
              density="compact"
              hide-details
              variant="outlined"
              placeholder="Max Position"
              label="Max Position"
              :disabled="!positionLimit[1]"
            ></v-text-field>
          </template>
        </v-range-slider>

      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">

      </v-col>
      <v-col cols="4">

      </v-col>
      <v-col cols="4" class="d-flex">

        <v-range-slider
          v-model="lengthFilter"
          :min="lengthLimit[0]"
          :max="lengthLimit[1]"
          :step="lengthStep"
          placeholder="Length"
          label="Length"
          hide-details
          class="v-col-12"
          thumb-label
          :disabled="!lengthLimit[1]"
        >
          <template v-slot:prepend>
            <v-text-field
              v-model="lengthFilter[0]"
              type="number"
              density="compact"
              hide-details
              variant="outlined"
              placeholder="Min Length"
              label="Min Length"
              :disabled="!lengthLimit[1]"
            ></v-text-field>
          </template>
          <template v-slot:append>
            <v-text-field
              v-model="lengthFilter[1]"
              type="number"
              density="compact"
              hide-details
              variant="outlined"
              placeholder="Max Length"
              label="Max Length"
              :disabled="!lengthLimit[1]"
            ></v-text-field>
          </template>
        </v-range-slider>

      </v-col>
    </v-row>
  </div>
</template>

<script>

import { defineComponent, ref, watch } from "vue";
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

    const lengthStep = 10;

    const positionStep = 10;

    const lengthFilter = reactiveVuex(store, "lengthFilter", "setLengthFilter"); // ref((Math.round(limitLength * 0.01) / lengthStep) * lengthStep);
    const lengthLimit = reactiveVuex(store, "lengthLimit", "setLengthLimit"); // ref((Math.round(limitLength * 0.01) / lengthStep) * lengthStep);

    const positionFilter = reactiveVuex(store, "positionFilter", "setPositionFilter"); // ref((Math.round(limitPosition * 0.01) / positionStep) * positionStep);
    const positionLimit = reactiveVuex(store, "positionLimit", "setPositionLimit"); // ref((Math.round(limitPosition * 0.99) / positionStep) * positionStep);

    let data;

    getData().then((d) => {
      data = d;
      if (data) {
        pivotItems.value = Object.keys(data.pangenome.paths);
      }
    });

    watch(selectedPivot, () => {
      let start;
      let end;
      let minLength = 0;
      let maxLength;
      if (data) {
        const steps = data.pangenome.paths[selectedPivot.value].steps;
        if (steps && steps.length) {
          steps.forEach((step) => {
            const panBlock = data.pangenome.panSkeleton[step.panBlock];
            start = start === undefined ? step.startPosition : Math.min(step.startPosition, start);
            end = end === undefined ? step.startPosition : Math.max(step.startPosition + panBlock.length);
            // minLength = minLength === undefined ? panBlock.length : Math.min(panBlock.length, minLength);
            maxLength = maxLength === undefined ? panBlock.length : Math.max(panBlock.length, maxLength);
          });
        }
      }
      lengthLimit.value = [minLength, maxLength];
      lengthFilter.value = [minLength, maxLength];

      positionFilter.value = [start, end];
      positionLimit.value = [start, end];

      return { start, end, minLength, maxLength };
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

      lengthLimit,
      lengthFilter,

      positionLimit,
      positionFilter,

      lengthStep,

      positionStep,

    };
  }
});
</script>

<style lang="scss" scoped>

::v-deep .v-field__input input {
  width: 60px;
}

</style>