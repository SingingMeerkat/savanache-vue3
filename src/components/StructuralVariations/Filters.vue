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

        <v-slider
          v-model="positionMin"
          :min="minPosition"
          :max="positionMax-positionStep"
          :step="positionStep"
          placeholder="Start Position"
          label="Start Position"
          hide-details
          class="v-col-6"
          thumb-label
        >
          <template v-slot:prepend>
            <v-text-field
              v-model="positionMin"
              type="number"
              density="compact"
              hide-details
              variant="outlined"
              placeholder="Start Position"
              label="Start Position"
            ></v-text-field>
          </template>
        </v-slider>

        <v-slider
          v-model="positionMax"
          :min="positionMin+positionStep"
          :max="maxPosition"
          :step="positionStep"
          placeholder="End Position"
          label="End Position"
          hide-details
          class="v-col-6"
          thumb-label
        >
          <template v-slot:append>
            <v-text-field
              v-model="positionMax"
              type="number"
              density="compact"
              hide-details
              variant="outlined"
              placeholder="End Position"
              label="End Position"
            ></v-text-field>
          </template>
        </v-slider>

      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">

      </v-col>
      <v-col cols="4">

      </v-col>
      <v-col cols="4" class="d-flex">

        <v-slider
          v-model="lengthMin"
          :min="minLength"
          :max="lengthMax-lengthStep"
          :step="lengthStep"
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
          :min="lengthMin+lengthStep"
          :max="maxLength"
          :step="lengthStep"
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

    const minLength = 0;
    const maxLength = 10000;
    const lengthStep = 10;

    const minPosition = 0;
    const maxPosition = ref(10000);
    const positionStep = 10;

    const lengthMin = reactiveVuex(store, "lengthMin", "setLengthMin"); // ref((Math.round(maxLength * 0.01) / lengthStep) * lengthStep);
    const lengthMax = reactiveVuex(store, "lengthMax", "setLengthMax"); // ref((Math.round(maxLength * 0.01) / lengthStep) * lengthStep);

    const positionMin = reactiveVuex(store, "positionMin", "setPositionMin"); // ref((Math.round(maxPosition * 0.01) / positionStep) * positionStep);
    const positionMax = reactiveVuex(store, "positionMax", "setPositionMax"); // ref((Math.round(maxPosition * 0.99) / positionStep) * positionStep);

    let data;

    getData().then((d) => {
      data = d;
      if (data) {
        pivotItems.value = Object.keys(data.pangenome.paths);
      }
    });

    watch(selectedPivot, () => {
      if (data) {
        const steps = data.pangenome.paths[selectedPivot.value].steps;
        const lastStep = steps[steps.length - 1];
        const startPosition = lastStep.startPosition + data.pangenome.panSkeleton[lastStep.panBlock].length;
        maxPosition.value = lastStep.startPosition;
        positionMax.value = startPosition;
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
      minLength,
      maxLength,
      lengthStep,

      positionMin,
      positionMax,
      minPosition,
      maxPosition,
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